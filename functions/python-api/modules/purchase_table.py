import pandas as pd
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps
from datetime import datetime, timedelta
import re
import io
import requests
from urllib.parse import urlparse
import os

# グローバル変数の設定
resource_path = f'./resources/'
font_path = f'{resource_path}Corporate-Logo-Bold-ver3.otf'
psa_logo_path = f'{resource_path}psa_logo.png' # PSA10バッジ

# テンプレートファイル一時ダウンロードディレクトリ（Lambdaでは/tmpを使用）
TEMP_DIR = "/tmp/temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

# テンプレートファイルURL
template_base_url = "https://static.mycalinks.io/pos/general/purchase-table/templates/"

# フォーマットパターンの設定
format_patterns = {
    '横長 8枚': (f'{template_base_url}HORIZONTAL.jpg', 4, 2),
    '横長 18枚': (f'{template_base_url}HORIZONTAL.jpg', 6, 3),
    '横長 36枚': (f'{template_base_url}HORIZONTAL.jpg', 9, 4),
    '縦長 4枚': (f'{template_base_url}VERTICAL.jpg', 2, 2),
    '縦長 9枚': (f'{template_base_url}VERTICAL.jpg', 3, 3),
    '縦長 16枚': (f'{template_base_url}VERTICAL.jpg', 4, 4),
    '縦長 25枚': (f'{template_base_url}VERTICAL.jpg', 5, 5),
    '正方形 2枚': (f'{template_base_url}SQUARE.jpg', 2, 1),
    '正方形 6枚': (f'{template_base_url}SQUARE.jpg', 3, 2),
    'モニター 3枚': (f'{template_base_url}MONITOR.jpg', 3, 1),
    'モニター 12枚': (f'{template_base_url}MONITOR.jpg', 6, 2),
    '強化買取 1枚': (f'{template_base_url}SQUARE.jpg', 1, 1),
    '強化買取 2枚': (f'{template_base_url}HORIZONTAL2.jpg', 2, 1),
}

# 画像をダウンロードして一時フォルダに保存し、ローカルパスを返す関数
def download_image(url):
    parsed_url = urlparse(url)
    filename = os.path.basename(parsed_url.path)  # URLのファイル名を取得
    local_path = os.path.join(TEMP_DIR, filename)

    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(local_path, "wb") as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)
    else:
        raise Exception(f"画像のダウンロードに失敗しました: {url}")

    return local_path

# カスタムテンプレートをダウンロードした後、規定サイズでは無い場合、強制的に解像度を変更する関数
def resize_to_template(template_width, template_height, custom_template_image_url):
    custom_template_image_path = download_image(custom_template_image_url)
    
    # 画像を開く
    custom_template_image = Image.open(custom_template_image_path)
    
    # 画像フォーマットをチェック
    if custom_template_image.format != "JPEG":
        rgb_image = custom_template_image.convert("RGB")
        new_image_path = os.path.splitext(custom_template_image_path)[0] + ".jpg"
        rgb_image.save(new_image_path, "JPEG")
        
        # 元の非JPEGファイルを削除
        os.remove(custom_template_image_path)
        
        # 新しいJPEG画像を開く
        custom_template_image_path = new_image_path
        custom_template_image = Image.open(custom_template_image_path)
    
    # 画像のサイズを取得
    width, height = custom_template_image.size
    
    # 画像のサイズが指定サイズではない場合、リサイズ
    if width != template_width or height != template_height:
        img = custom_template_image.resize((template_width, template_height), Image.LANCZOS)
        img.save(custom_template_image_path, "JPEG")
    
    return custom_template_image_path


# フォントサイズ調整
def adjust_font_size(draw, text, font, max_width):
    width, _ = draw.textbbox((0, 0), text, font=font)[2:]
    if width <= max_width:
        return font
    font_size = font.size
    while width > max_width and font_size > 1:
        font_size -= 1
        font = ImageFont.truetype(font_path, font_size)
        width, _ = draw.textbbox((0, 0), text, font=font)[2:]
    return font

# 商品名に(sv7a 019/064 RR)の様な表記が存在する場合は削除する関数
def remove_parentheses(card_name, number):
    if any(c in card_name for c in '()（）'):
        # number を含む括弧のペアを検索（全角・半角対応）
        match = re.search(fr'[\(（][^）)]*{re.escape(number)}[^）)]*[\)）]', card_name, re.IGNORECASE)
        if match:
            # number を含む括弧のペアのみ削除（全角・半角対応）
            card_name = re.sub(fr'\s*[\(（][^）)]*{re.escape(number)}[^）)]*[\)）]', '', card_name, flags=re.IGNORECASE)
    return card_name


# オリジナル画像の縦横比を維持しつつ、新しい幅に基づいた高さを計算して返す関数
def calculate_resized_height(image_path: str, card_img_width: int, max_height: int = None) -> int:
    """
    指定された画像ファイルの元の縦横比を維持しつつ、
    新しい幅に基づいた高さを計算して返します。
    max_heightが指定された場合、計算された高さがmax_heightを超える場合はmax_heightを返します。

    Args:
        image_path (str): 画像ファイルのパス。
        card_img_width (int): 新しい画像の目標横幅。
        max_height (int, optional): 許容される最大の高さ。Noneの場合は制限なし。

    Returns:
        int: 計算された新しい画像の高さ。エラーの場合は-1を返します。
    """
    try:
        with Image.open(io.BytesIO(requests.get(image_path).content)) as img:
            origin_width, origin_height = img.size

        # 縦横比を計算 (小数)
        aspect_ratio_decimal = origin_width / origin_height

        # 新しい高さを計算（int型にして、小数点以下切り捨て）
        resized_height = int(card_img_width / aspect_ratio_decimal)

        # max_heightの制限を適用
        if max_height is not None and resized_height > max_height:
            return max_height
       
        return resized_height

    except FileNotFoundError:
        print(f"エラー: ファイルが見つかりません - {image_path}")
        return -1
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        return -1

# filtered_dfはカード情報
def generate_image_yoko8(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    print(f"横長8枚画像生成開始 - アイテム数: {len(filtered_df)}")
    # テンプレート画像解像度
    template_width = 3579
    template_height = 2551
    print("テンプレート設定完了")

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        print("カスタムテンプレート使用")
        format_img_url, max_columns, max_rows = format_patterns['横長 8枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        print("通常テンプレート使用開始")
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['横長 8枚']
        print(f"テンプレートダウンロード開始: {format_img_url}")
        format_img_path = download_image(format_img_url)
        print(f"テンプレートダウンロード完了: {format_img_path}")

    # データを8枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 7) // 8  # 8枚ずつ分割して必要な画像枚数を計算
    print(f"画像分割設定完了 - 総レコード数: {total_records}, 画像枚数: {num_images}")

    result_images = []

    # 画像を一枚ずつ作っていく
    print(f"画像生成ループ開始 - {num_images}枚の画像を生成")
    for image_index in range(num_images):
        print(f"画像 {image_index + 1}/{num_images} の処理開始")
        # 現在の範囲のレコードを取得
        start_index = image_index * 8
        end_index = min(start_index + 8, total_records)
        subset_df = filtered_df[start_index:end_index]
        print(f"データ範囲: {start_index}-{end_index}, アイテム数: {len(subset_df)}")

        try:
            print("フォーマット画像読み込み開始")
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
            print("フォーマット画像読み込み完了")
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return
        
        x_start = 300  # 大きいほど右に
        y_start = 362  # 小さいほど上に
        card_img_width = 650
        card_img_height = 910
        x_offset = card_img_width + 125
        y_offset = card_img_height + 70
        frame_img_height = 200

        border = 15

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        # カード型番を表示するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 60
        number_border = 5

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width + 5, y_position + card_img_height - number_frame_img_height - 210))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 70)
            price_font = ImageFont.truetype(font_path, 100)
            card_number_font = ImageFont.truetype(font_path, 38)

            if card_name and price:
                text_y_position = y_position + card_img_height - 175  # マイナスが大きいほど上に

                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 70), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 325, card_number_y_position + 218), card_number, fill='black', font=card_number_font)

        # 注意書き
        info_font = ImageFont.truetype(font_path, 55)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 1200)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 170 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1150 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 160
        update_y_position = format_img_height - update_height - 95
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1130
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 100)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1130
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    return result_images

def generate_image_yoko18(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 3579
    template_height = 2551

    # カスタムテンプレートが指定されているならそれを使用し、
    # テンプレート解像度では無い場合、強制的にリサイズする
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['横長 18枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['横長 18枚']
        format_img_path = download_image(format_img_url)

    # データを18枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 17) // 18  # 18枚ずつ分割して必要な画像枚数を計算

    result_images = []

    # 画像を一枚ずつ作っていく
    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 18
        end_index = min(start_index + 18, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 250 # 大きいほど右に
        y_start = 335 # 小さいほど上に
        # カードサイズ
        card_img_width = 450
        card_img_height = 630
        # 隣のカードとの間隔
        x_offset = card_img_width + 75
        y_offset = card_img_height + 30
        frame_img_height = 150

        # ボーダー幅
        border = 15

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 40
        # ボーダー幅
        number_border = 5

        # カード型番を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))


        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - 10 + number_frame_img_width , y_position + card_img_height - number_frame_img_height - 160))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 50)
            price_font = ImageFont.truetype(font_path, 70)
            card_number_font = ImageFont.truetype(font_path, 24)

            if card_name and price:
                text_y_position = y_position + card_img_height - 130  # マイナスが大きいほど上に

                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 60), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)

                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 225, card_number_y_position +138), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 55)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 1200)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 170 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1150 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 160
        update_y_position = format_img_height - update_height - 95
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1130
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 100)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1130
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img)

    return result_images

def generate_image_yoko36(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 3579
    template_height = 2551

    # カスタムテンプレートが指定されているならそれを使用し、
    # テンプレート解像度では無い場合、強制的にリサイズする
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['横長 36枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['横長 36枚']
        format_img_path = download_image(format_img_url)

    # データを36枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 35) // 36  # 36枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 36
        end_index = min(start_index + 36, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return
            
        x_start = 198 # 大きいほど右に
        y_start = 332 # 小さいほど上に
        # カードサイズ
        card_img_width = 330
        card_img_height = 462
        # 隣のカードとの間隔
        x_offset = card_img_width + 26
        y_offset = card_img_height + 32
        frame_img_height = 120

        # ボーダー幅
        border = 12

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 25
        # ボーダー幅
        number_border = 4

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else: # あいてる時のやつ
                card_img = None
                card_name = ""
                rarity = ""
                price = ""

            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理
            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - 8 + number_frame_img_width , y_position + card_img_height - number_frame_img_height - 128))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 40)
            price_font = ImageFont.truetype(font_path, 60)
            card_number_font = ImageFont.truetype(font_path, 20)


            if card_name and price:
                text_y_position = y_position + card_img_height - 100  # マイナスが大きいほど上に

                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 40), price_text, fill=cardname_and_price_text_color, font=price_font)


                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 165, card_number_y_position +93), card_number, fill='black', font=card_number_font)

        # 注意書き
        info_font = ImageFont.truetype(font_path, 55)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 1200)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 170 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1150 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 160
        update_y_position = format_img_height - update_height - 95
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1130
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 100)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1130
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    return result_images


def generate_image_tate4(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 2551
    template_height = 3579

    # カスタムテンプレートが指定されているならそれを使用し、
    # テンプレート解像度では無い場合、強制的にリサイズする
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['縦長 4枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['縦長 4枚']
        format_img_path = download_image(format_img_url)

    # データを4枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 3) // 4  # 18枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 4
        end_index = min(start_index + 4, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 225  # 大きいほど右に
        y_start = 395  # 小さいほど上に
        # カードサイズ
        card_img_width = 1000
        card_img_height = 1401
        # 隣のカードとの間隔
        x_offset = card_img_width + 100
        y_offset = card_img_height + 100
        frame_img_height = 260

        # ボーダー幅
        border = 20

        # カード名、買取価格を表示するフレーム
        # ユーザが明示的にcolorを選択していなかった場合の初期値確認中
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 80
        # ボーダー幅
        number_border = 10

        # ユーザが明示的にcolorを選択していなかった場合、指定の色で枠を描画
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))


        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else: # あいてる時のやつ
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset


            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width , y_position + card_img_height - number_frame_img_height - 280))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 100)
            price_font = ImageFont.truetype(font_path, 130)
            card_number_font = ImageFont.truetype(font_path, 60)

            if card_name and price:
                text_y_position = y_position + card_img_height - 230  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 95), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"
                
                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 501, card_number_y_position +389), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 50)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 900)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1680 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 110
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1620 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 80)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1670
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 
    
    os.remove(format_img_path)

    return result_images


def generate_image_tate9(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 2551
    template_height = 3579

    # カスタムテンプレートが指定されているならそれを使用し、
    # テンプレート解像度では無い場合、強制的にリサイズする
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['縦長 9枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['縦長 9枚']
        format_img_path = download_image(format_img_url)

    # データを9枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 8) // 9  # 9枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 9
        end_index = min(start_index + 9, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 190  # 大きいほど右に
        y_start = 365  # 小さいほど上に
        # カードサイズ
        card_img_width = 680
        card_img_height = 952
        # 隣のカードとの間隔
        x_offset = card_img_width + 65
        y_offset = card_img_height + 50
        frame_img_height = 200

        # ボーダー幅
        border = 15

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        
        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 60
        # ボーダー幅
        number_border = 5

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))


        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else: # あいてる時のやつ
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width + 5, y_position + card_img_height - number_frame_img_height - 210))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 70)
            price_font = ImageFont.truetype(font_path, 100)
            card_number_font = ImageFont.truetype(font_path, 40)

            if card_name and price:
                text_y_position = y_position + card_img_height - 180  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 70), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 340, card_number_y_position + 239), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 50)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 900)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1680 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 110
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1620 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 80)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1670
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_tate16(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 2551
    template_height = 3579

    # カスタムテンプレートが指定されているならそれを使用し、
    # テンプレート解像度では無い場合、強制的にリサイズする
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['縦長 16枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['縦長 16枚']
        format_img_path = download_image(format_img_url)

    # データを16枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 15) // 16  # 16枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 16
        end_index = min(start_index + 16, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 180  # 大きいほど右に
        y_start = 355  # 小さいほど上に
        # カードサイズ
        card_img_width = 510
        card_img_height = 714
        # 隣のカードとの間隔
        x_offset = card_img_width + 50
        y_offset = card_img_height + 40
        frame_img_height = 160

        # ボーダー幅
        border = 15

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')                

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 45
        # ボーダー幅
        number_border = 5

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))


        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset


            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width + 5, y_position + card_img_height - number_frame_img_height - 170))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 60)
            price_font = ImageFont.truetype(font_path, 90)
            card_number_font = ImageFont.truetype(font_path, 30)


            if card_name and price:
                text_y_position = y_position + card_img_height - 145  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 55), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 255, card_number_y_position +168), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 50)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 900)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1680 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 110
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1620 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 80)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1670
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images


def generate_image_tate25(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 2551
    template_height = 3579

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['縦長 25枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['縦長 25枚']
        format_img_path = download_image(format_img_url)

    # データを25枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 24) // 25  # 25枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 25
        end_index = min(start_index + 25, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 170  # 大きいほど右に
        y_start = 348  # 小さいほど上に
        # カードサイズ
        card_img_width = 410
        card_img_height = 574
        # 隣のカードとの間隔
        x_offset = card_img_width + 40
        y_offset = card_img_height + 30
        frame_img_height = 130

        # ボーダー幅
        border = 15

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 30
        # ボーダー幅
        number_border = 4

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset


            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - 8 + number_frame_img_width , y_position + card_img_height - number_frame_img_height - 138))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 50)
            price_font = ImageFont.truetype(font_path, 70)
            card_number_font = ImageFont.truetype(font_path, 25)


            if card_name and price:
                text_y_position = y_position + card_img_height - 115  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 51), price_text, fill=cardname_and_price_text_color, font=price_font)


                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 206, card_number_y_position +136), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 50)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 900)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1680 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 65)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 110
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 120)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1620 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 80)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1670
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_seihoukei2(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 4000
    template_height = 4000

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['正方形 2枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['正方形 2枚']
        format_img_path = download_image(format_img_url)

    # データを2枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 1) // 2  # 2

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 2
        end_index = min(start_index + 2, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 300 # 大きいほど右に
        y_start = 670 # 小さいほど上に
        # カードサイズ
        card_img_width = 1600
        card_img_height = 2241
        # 隣のカードとの間隔
        x_offset = card_img_width + 190
        y_offset = card_img_height + 500
        frame_img_height = 500

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img = Image.new('RGB', (card_img_width, frame_img_height), color=color)
        else:
            # デフォルトカラー(マイカレッド)
            frame_img = Image.new('RGB', (card_img_width, frame_img_height), color=(162,58,49))

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 120
        # ボーダー幅
        number_border = 10

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else: # あいてる時のやつ
                card_img = None
                card_name = ""
                rarity = ""
                price = ""
            
            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position, y_position + card_img_height - frame_img_height + 600))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position, y_position + card_img_height - frame_img_height + 600))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - number_border + number_frame_img_width - 10, y_position + card_img_height - number_frame_img_height - 20))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 180)
            price_font = ImageFont.truetype(font_path, 280)
            card_number_font = ImageFont.truetype(font_path, 90)


            if card_name and price:
                text_y_position = y_position + card_img_height + 110  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 170), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 800, card_number_y_position + 1050), card_number, fill='black', font=card_number_font)



        # 注意書き
        info_font = ImageFont.truetype(font_path, 80)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 1300)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1850 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 120)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 130
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 180)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1745 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 120)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1850
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_seihoukei6(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 4000
    template_height = 4000

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['正方形 6枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['正方形 6枚']
        format_img_path = download_image(format_img_url)

    # データを6枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 5) // 6  # 6枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 6
        end_index = min(start_index + 6, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return

        x_start = 280 # 大きいほど右に
        y_start = 590 # 小さいほど上に
        # カードサイズ
        card_img_width = 1050
        card_img_height = 1471
        # 隣のカードとの間隔
        x_offset = card_img_width + 140
        y_offset = card_img_height + 100
        frame_img_height = 350

        # ボーダー幅
        border = 20

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 80
        # ボーダー幅
        number_border = 10

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""

            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset


            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width , y_position + card_img_height - number_frame_img_height - 370))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 110)
            price_font = ImageFont.truetype(font_path, 180)
            card_number_font = ImageFont.truetype(font_path, 60)


            if card_name and price:
                text_y_position = y_position + card_img_height - 320  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 130), price_text, fill=cardname_and_price_text_color, font=price_font)


                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 525, card_number_y_position +335), card_number, fill='black', font=card_number_font)

        # 注意書き
        info_font = ImageFont.truetype(font_path, 80)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 1300)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1850 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 120)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 130
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 180)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1745 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 120)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1850
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_monitor3(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 1920
    template_height = 1080

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['モニター 3枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['モニター 3枚']
        format_img_path = download_image(format_img_url)

    # データを3枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 2) // 3  # 3枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 3
        end_index = min(start_index + 3, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return
        
        x_start = 110 # 大きいほど右に
        y_start = 170 # 小さいほど上に
        # カードサイズ
        card_img_width = 540
        card_img_height = 757
        # 隣のカードとの間隔
        x_offset = card_img_width + 40
        y_offset = card_img_height + 20
        frame_img_height = 180

        # ボーダー幅
        border = 10

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')   

        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 45
        # ボーダー幅
        number_border = 5

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else: # あいてる時のやつ
                card_img = None
                card_name = ""
                rarity = ""
                price = ""

            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width , y_position + card_img_height - number_frame_img_height - 190))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 60)
            price_font = ImageFont.truetype(font_path, 90)
            card_number_font = ImageFont.truetype(font_path, 30)


            if card_name and price:
                text_y_position = y_position + card_img_height - 165  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 70), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 270, card_number_y_position +170), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 32)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 650)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 70 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 490 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 32)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 70
        update_y_position = format_img_height - update_height - 40
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 55)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 480 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 45)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 480
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_monitor12(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 1920
    template_height = 1080

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['モニター 12枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['モニター 12枚']
        format_img_path = download_image(format_img_url)

    # データを12枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 11) // 12  # 12枚ずつ分割して必要な画像枚数を計算

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 12
        end_index = min(start_index + 12, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return
        
        x_start = 100 # 大きいほど右に
        y_start = 155 # 小さいほど上に
        # カードサイズ
        card_img_width = 270
        card_img_height = 379
        # 隣のカードとの間隔
        x_offset = card_img_width + 20
        y_offset = card_img_height + 30
        frame_img_height = 100

        # ボーダー幅
        border = 8

        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (card_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
    
        ## 型番を記載するフレーム
        number_frame_img_width = card_img_width // 2
        number_frame_img_height = 23
        # ボーダー幅
        number_border = 3

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))


        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""

            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset


            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - border , y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - border + number_frame_img_width + 2 , y_position + card_img_height - number_frame_img_height - 106))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 30)
            price_font = ImageFont.truetype(font_path, 48)
            card_number_font = ImageFont.truetype(font_path, 15)

            if card_name and price:
                text_y_position = y_position + card_img_height - 90  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position + 40), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # フォントの自動調整とバウンディングボックス取得
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 134, card_number_y_position +74), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 32)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 650)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 70 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 490 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 32)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 70
        update_y_position = format_img_height - update_height - 40
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 55)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 480 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 45)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 480
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_kyouka1(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 4000
    template_height = 4000

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['強化買取 1枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['強化買取 1枚']
        format_img_path = download_image(format_img_url)

    # データを1枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records) // 1

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 1
        end_index = min(start_index + 1, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return
        

        x_start = 900 # 大きいほど右に
        y_start = 570 # 小さいほど上に
        card_img_width = 2200
        card_img_height = 3081

        # 隣のカードとの間隔
        x_offset = card_img_width + 190
        y_offset = card_img_height + 500
        frame_img_height = 500
        frame_img_width =  card_img_width + 800

        border = 20

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (frame_img_width, frame_img_height + 400), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (frame_img_width, frame_img_height + 400), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        # number_frame_img_width = card_img_width // 2
        number_frame_img_width = (card_img_width + 800) // 2
        number_frame_img_height = 180
        # ボーダー幅
        number_border = 20

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)
                
                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else: # あいてる時のやつ
                card_img = None
                card_name = ""
                rarity = ""
                price = ""

            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset

            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - 420, y_position + card_img_height - frame_img_height - 400 ))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - 420, y_position + card_img_height - frame_img_height - 400 ))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - number_border + number_frame_img_width - 10 - 410, y_position + card_img_height - number_frame_img_height - 980))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )

            card_name_font_base = ImageFont.truetype(font_path, 280)
            price_font = ImageFont.truetype(font_path, 420)
            card_number_font = ImageFont.truetype(font_path, 140)

            if card_name and price:
                text_y_position = y_position + card_img_height + 110  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                # card_name_font = adjust_font_size(draw, card_info, card_name_font_base, card_img_width)
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, frame_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position - 980), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position - 600), price_text, fill=cardname_and_price_text_color, font=price_font)

                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"
                
                # 型番のバウンディングボックスを取得し、中央揃え
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 900, card_number_y_position + 490), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 80)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 1300)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 120 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 1850 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 120)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 130
        update_y_position = format_img_height - update_height - 80
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 180)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 1745 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 120)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 1850
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images

def generate_image_kyouka2(filtered_df, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name):
    # テンプレート画像解像度
    template_width = 1477
    template_height = 1108

    # カスタムテンプレートが指定されているならそれを使用
    if custom_template_image_url:
        format_img_url, max_columns, max_rows = format_patterns['強化買取 2枚']
        format_img_path = resize_to_template(template_width, template_height, custom_template_image_url)
    else:
        # custom_template_image_urlが「None」の場合、通常テンプレートを使用
        # 画像のダウンロードと変数設定
        format_img_url, max_columns, max_rows = format_patterns['強化買取 2枚']
        format_img_path = download_image(format_img_url)

    # データを2枚ずつ分割
    total_records = len(filtered_df)
    num_images = (total_records + 1) // 2  # 2

    result_images = []

    for image_index in range(num_images):
        # 現在の範囲のレコードを取得
        start_index = image_index * 2
        end_index = min(start_index + 2, total_records)
        subset_df = filtered_df[start_index:end_index]

        try:
            format_img = Image.open(format_img_path)
            draw = ImageDraw.Draw(format_img)
        except Exception as e:
            print("エラー", f"フォーマット画像の読み込みに失敗しました: {e}")
            return
        
        x_start = 119 # 大きいほど右に
        y_start = 185 # 小さいほど上に
        # カードサイズ
        card_img_width = 570
        card_img_height = 798
        # 隣のカードとの間隔
        x_offset = card_img_width + 100
        y_offset = card_img_height + 500

        # ボーダー幅
        border = 10

        frame_img_height = 180
        frame_img_width =  card_img_width + 80

        # ボーダー幅
        border = 10

        # カード名、買取価格を表示するフレーム
        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            frame_img_org = Image.new('RGB', (frame_img_width, frame_img_height), color=color)
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')
        else:
            # デフォルトカラー(マイカレッド)
            frame_img_org = Image.new('RGB', (frame_img_width, frame_img_height), color=(162, 58, 49))
            frame_img = ImageOps.expand(frame_img_org, border=border, fill='white')

        ## 型番を記載するフレーム
        # number_frame_img_width = card_img_width // 2
        number_frame_img_width = (card_img_width + 80) // 2
        number_frame_img_height = 50
        # ボーダー幅
        number_border = 5

        # 空 or #XXXXXX
        if color:
            # カスタムカラー
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=color)            
        else:
            # デフォルトカラー(マイカレッド)
            number_frame_img_org = Image.new('RGB', (number_frame_img_width, number_frame_img_height), color='white')
            number_frame_img = ImageOps.expand(number_frame_img_org, border=number_border, fill=(162, 58, 49))

        for index in range(max_columns * max_rows):
            if index < len(subset_df):
                row = subset_df[index]

                rarity = row['rarity']
                price = row['buy_price']
                expansion = row['expansion']
                number = row['cardnumber']

                card_name = remove_parentheses(row['cardname'],number)

                image_path = row['full_image_url']
                genre_name = row['cardgenre']
                any_model_number = row['any_model_number']
                special_condition = row['special_condition']
                card_name = re.sub(r'\(小文字\)|\(大文字\)', '', card_name).strip()

                card_img_height_resize = calculate_resized_height(image_path,card_img_width,card_img_height)

                try:
                  card_img = Image.open(io.BytesIO(requests.get(image_path).content))
                  card_img = card_img.resize((card_img_width, card_img_height_resize))
                except Exception as e:
                  # 画像をダミーに置き換え
                  dummy_img = Image.open(f"{resource_path}trading_card01_blue.jpg")
                  card_img = dummy_img.resize((card_img_width, card_img_height))
                  print("#####################")
                  print(f"pos_product_id:{row['id']},{card_name}:{rarity}:{number}")
                  print(e)
                  print("画像ファイルがないかパスが間違っています、ダミーに置き換えます。")
                  print("#####################")

                # 表示が長くなってしまう為、rarityが「クォーターセンチュリーシークレット」の場合、置き換える
                if rarity == 'クォーターセンチュリーシークレット':
                    rarity = 'QCシークレット'

            else:
                card_img = None
                card_name = ""
                rarity = ""
                price = ""

            col = index % max_columns
            rows = index // max_columns
            x_position = x_start + col * x_offset
            y_position = y_start + rows * y_offset


            ## ワンピース特殊処理

            if card_img:
                if genre_name == "OP" or "ポケモン":
                    card_img = Image.open(io.BytesIO(requests.get(image_path).content)).resize((card_img_width, card_img_height_resize)).convert("RGBA")
                    background_wb = Image.new("RGB", card_img.size, (255, 255, 255))
                    background_wb.paste(card_img, mask=card_img.split()[3])
                    card_img = background_wb

                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - 10 - 40, y_position + card_img_height - frame_img_height))

                else:
                    format_img.paste(card_img, (x_position, y_position))
                    format_img.paste(frame_img, (x_position - 10 - 40, y_position + card_img_height - frame_img_height))

                # 型番フレーム、ドンカード以外はフレーム追加
                if not card_name == "ドンカード":
                    format_img.paste(number_frame_img, (x_position - number_border + number_frame_img_width - 10 -35, y_position + card_img_height - number_frame_img_height - 20 - 180))

                # PSAロゴ追加
                if special_condition == "psa10":
                    # 透過情報を保ったまま画像を開く
                    psa_logo_img = Image.open(psa_logo_path).resize(
                        (card_img_width // 3, card_img_width // 3)
                    ).convert("RGBA")

                    # 貼り付け時にマスクを指定することで透過を反映
                    format_img.paste(
                        psa_logo_img,
                        (x_position + card_img_width - card_img_width // 3 - 10 , y_position + 10),
                        psa_logo_img
                    )
                    
            card_name_font_base = ImageFont.truetype(font_path, 64)
            price_font = ImageFont.truetype(font_path, 90)
            card_number_font = ImageFont.truetype(font_path, 40)


            if card_name and price:
                text_y_position = y_position + card_img_height + 110  # マイナスが大きいほど上に
                
                # 「型番問わず」の場合、レアリティを表示しない
                if any_model_number == True:
                    card_info = f"{card_name}"
                else:
                    card_info = f"{card_name} {rarity}"
                
                # フォントの自動調整
                card_name_font = adjust_font_size(draw, card_info, card_name_font_base, frame_img_width)
                card_info_bbox = draw.textbbox((0, 0), card_info, font=card_name_font)
                card_info_width = card_info_bbox[2] - card_info_bbox[0]
                
                # テキストの中心揃え
                card_info_x_position = x_position + (card_img_width - card_info_width) // 2
                draw.text((card_info_x_position, text_y_position -280), card_info, fill=cardname_and_price_text_color, font=card_name_font)

                # 価格の表示
                price_text = f"￥{'{:,}'.format(price)}"
                price_bbox = draw.textbbox((0, 0), price_text, font=price_font)
                price_width = price_bbox[2] - price_bbox[0]
                price_x_position = x_position + (card_img_width - price_width) // 2
                draw.text((price_x_position, text_y_position - 205), price_text, fill=cardname_and_price_text_color, font=price_font)


                # 型番挿入処理
                if any_model_number == True:
                    card_number = "型番問わず"
                else:
                    if genre_name == "遊戯王":
                        card_number = number
                    elif genre_name == "OP":
                        card_type = row['type']
                        if card_type != "ドンカード":
                            card_number = number
                        else:
                            card_number = ""
                    elif genre_name == "DM":
                        card_number = f"{expansion} {number}"
                    elif genre_name == "ポケモン":
                        card_number = f"{expansion} {number}"
                    # 上記以外のTCGタイトル
                    else:
                        card_number = f"{expansion} {number}"

                # 型番のバウンディングボックスを取得し、中央揃え
                card_number_font = adjust_font_size(draw, card_number, card_number_font, number_frame_img_width)
                card_number_bbox = draw.textbbox((0, 0), card_number, font=card_number_font)
                card_number_width = card_number_bbox[2] - card_number_bbox[0]
                card_number_height = card_number_bbox[3] - card_number_bbox[1]

                # カード画像エリアの中央のY座標を計算
                card_img_center_y = y_position + card_img_height // 2

                # 中央揃えのY座標を計算
                card_number_y_position = card_img_center_y - card_number_height // 2

                # 右半分にカード番号を配置（X座標）
                card_number_x_position = x_position + (card_img_width + (card_img_width // 2 - card_number_width) // 2)
                
                # カード番号の描画（X座標とY座標）
                draw.text((card_number_x_position - number_border - 265, card_number_y_position + 175), card_number, fill='black', font=card_number_font)


        # 注意書き
        info_font = ImageFont.truetype(font_path, 24)
        info_text = comment
        info_font = adjust_font_size(draw, info_text, info_font, 500)
        info_bbox = draw.textbbox((0, 0), info_text, font=info_font)
        info_height = info_bbox[3] - info_bbox[1]
        format_img_width, format_img_height = format_img.size
        info_x_position = 30 # X軸左からのスタート位置
        info_y_position = (format_img_height - info_height) / 2 + 513 # Y軸中央揃えの位置を計算
        draw.text((info_x_position, info_y_position), info_text, fill=background_text_color, font=info_font)

        # 更新日
        update_date = (datetime.now() + timedelta(hours=9)).strftime("%Y/%m/%d")
        update_font = ImageFont.truetype(font_path, 40)
        update_text = f"更新日  {update_date}"
        update_bbox = draw.textbbox((0, 0), update_text, font=update_font)
        update_width = update_bbox[2] - update_bbox[0]
        update_height = update_bbox[3] - update_bbox[1]
        format_img_width, format_img_height = format_img.size
        update_x_position = format_img_width - update_width - 30
        update_y_position = format_img_height - update_height - 20
        draw.text((update_x_position, update_y_position), update_text, fill=background_text_color, font=update_font)

        # タイトル
        title_font = ImageFont.truetype(font_path, 80)
        title_text = title
        title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
        title_width = title_bbox[2] - title_bbox[0]
        title_height = title_bbox[3] - title_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        title_x_position = (format_img_width - title_width) / 2
        title_y_position = (format_img_height - title_height) / 2 - 490 # マイナス大きいほど上に
        draw.text((title_x_position, title_y_position), title_text, fill=background_text_color, font=title_font)

        # ショップ名
        shop_font = ImageFont.truetype(font_path, 40)
        shop_bbox = draw.textbbox((0, 0), store_name, font=shop_font)
        shop_width = shop_bbox[2] - shop_bbox[0]
        shop_height = shop_bbox[3] - shop_bbox[1]
        format_img_width, format_img_height = format_img.size

        # 中央揃えの位置を計算
        shop_x_position = (format_img_width - shop_width) / 2
        shop_y_position = (format_img_height - shop_height) / 2 + 510
        draw.text((shop_x_position, shop_y_position), store_name, fill=background_text_color, font=shop_font)

        result_images.append(format_img) 

    os.remove(format_img_path)

    return result_images