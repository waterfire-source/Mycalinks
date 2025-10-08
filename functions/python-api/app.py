import json
import boto3
import os
from flask import Flask, request, jsonify
import base64
from modules import purchase_table
import io
import datetime
import uuid

# Flask app from sidecar
flask_app = Flask(__name__)

# AWS clients (IAM role authentication)
s3_client = boto3.client('s3', region_name='ap-northeast-1')
s3_bucket = os.environ.get("AMAZON_S3_BUCKET")
bot_token = os.environ.get("BOT_TOKEN")

# Token authentication middleware
@flask_app.before_request
def check_token():
    token = request.headers.get("Authorization")
    
    if not token:
        return jsonify({"error": "permission denied"}), 401
    
    parts = token.split()
    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"error": "permission denied"}), 401
    
    token_value = parts[1]

    if token_value != bot_token:
        return jsonify({"error": "permission denied"}), 401
    
    return None

# ヘルスチェック用
@flask_app.route('/health', methods=["GET"])
def healthCheckController():
    return jsonify({"status": "ok"})

# Purchase table generation endpoint
@flask_app.route('/generate-purchase-table', methods=["POST"])
def generatePurchaseTableController():
    print("=== 買取表生成開始 ===")
    body = request.json
    print(f"リクエストボディ受信: {len(str(body))} 文字")
    
    title = body['title']
    format = body['format']
    color = body['color']
    background_text_color = body['background_text_color']
    cardname_and_price_text_color = body['cardname_and_price_text_color']
    custom_template_image_url = body['custom_template_image_url']
    comment = body['comment']
    items = body['items']
    store_id = body['store_id']
    store_name = body['store_name']
    
    print(f"パラメータ解析完了 - フォーマット: {format}, アイテム数: {len(items)}, 店舗ID: {store_id}")

    # Format handlers
    print(f"画像生成処理開始 - フォーマット: {format}")
    try:
        if format == "HORIZONTAL_8":
            formatted_images = purchase_table.generate_image_yoko8(items, title, comment, color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "HORIZONTAL_18":
            formatted_images = purchase_table.generate_image_yoko18(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "HORIZONTAL_36":
            formatted_images = purchase_table.generate_image_yoko36(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "VERTICAL_4":
            formatted_images = purchase_table.generate_image_tate4(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "VERTICAL_9":
            formatted_images = purchase_table.generate_image_tate9(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "VERTICAL_16":
            formatted_images = purchase_table.generate_image_tate16(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "VERTICAL_25":
            formatted_images = purchase_table.generate_image_tate25(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "SQUARE_2":
            formatted_images = purchase_table.generate_image_seihoukei2(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "SQUARE_6":
            formatted_images = purchase_table.generate_image_seihoukei6(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "MONITOR_3":
            formatted_images = purchase_table.generate_image_monitor3(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "MONITOR_12":
            formatted_images = purchase_table.generate_image_monitor12(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "ENHANCED_1":
            formatted_images = purchase_table.generate_image_kyouka1(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        elif format == "ENHANCED_2":
            formatted_images = purchase_table.generate_image_kyouka2(items, title, comment ,color, background_text_color, cardname_and_price_text_color, custom_template_image_url, store_name)
        else:
            print(f"未対応フォーマット: {format}")
            return jsonify({"error": f"未対応フォーマット: {format}"}), 400
            
        print(f"画像生成完了 - 生成画像数: {len(formatted_images)}")
    except Exception as e:
        print(f"画像生成エラー: {str(e)}")
        return jsonify({"error": f"画像生成エラー: {str(e)}"}), 500

    print("S3アップロード処理開始")
    generated_images = []
    # Upload images to S3
    try:
        for index, image in enumerate(formatted_images):
            print(f"画像 {index + 1}/{len(formatted_images)} のアップロード開始")
            in_mem_file = io.BytesIO()
            image.save(in_mem_file, format=image.format)
            in_mem_file.seek(0)

            uuid_str = uuid.uuid4()
            file_name = f'purchase-table-{datetime.datetime.now().strftime("%Y%m%d%H%M%S")}-{uuid_str}.jpg'
            file_key = f'pos/store/{store_id}/purchase-table/{file_name}'
            file_url = f'https://{s3_bucket}/{file_key}'
            
            print(f"S3アップロード開始: {file_key}")

            upload_res = s3_client.upload_fileobj(
                in_mem_file,
                s3_bucket,
                file_key,
                ExtraArgs={
                    'ContentType': 'image/jpeg',
                    'ACL': 'public-read'
                },
            )
            
            print(f"S3アップロード完了: {file_key}")

            generated_images.append({
                "order_number": index + 1,
                "image_url": file_url,
            })

        print(f"全ての画像アップロード完了 - 合計: {len(generated_images)}枚")
        print("=== 買取表生成完了 ===")
        
        return jsonify({
            "images": generated_images
        })
    except Exception as e:
        print(f"S3アップロードエラー: {str(e)}")
        return jsonify({"error": f"S3アップロードエラー: {str(e)}"}), 500

# Lambda handler for API Gateway integration
def lambda_handler(event, context):
    # Convert API Gateway event to Flask request
    from werkzeug.test import Client
    from werkzeug.wrappers import Response
    
    # Create test client
    client = Client(flask_app, Response)
    
    # Extract path and method from event
    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    headers = event.get('headers', {})
    body = event.get('body', '')
    query_params = event.get('queryStringParameters', {}) or {}
    
    # Handle base64 encoded body
    if event.get('isBase64Encoded', False) and body:
        body = base64.b64decode(body).decode('utf-8')
    
    # Convert query parameters to query string
    query_string = '&'.join([f"{k}={v}" for k, v in query_params.items()]) if query_params else ''
    
    # Make request to Flask app
    response = client.open(
        path=path,
        method=method,
        headers=list(headers.items()),
        data=body,
        query_string=query_string,
        content_type=headers.get('Content-Type', 'application/json')
    )
    
    # Convert Flask response to API Gateway response
    return {
        'statusCode': response.status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        'body': response.get_data(as_text=True)
    }

if __name__ == "__main__":
    flask_app.run()