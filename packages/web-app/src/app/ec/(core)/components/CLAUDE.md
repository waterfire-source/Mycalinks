# EC Core Components - ECサイト共通コンポーネント

## 目的
ECサイト全体で使用される共通UIコンポーネントを提供

## 実装されている機能

### メインコンポーネント (6個)

#### MallContent.tsx (74行)
```typescript
export const MallContent = ({
  genreCards,
  carouselItems,
  banners,
}: MallContentProps) => {
  const router = useRouter();
  
  return (
    <>
      <CarouselBanner items={carouselItems} />
      <Box sx={{ bgcolor: '#d32f2f', color: 'white', py: 1.5, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold">
          Mycalinks Mall
        </Typography>
      </Box>
      
      <Grid container spacing={1.5} sx={{ px: 1.5 }}>
        {genreCards.map((card) => (
          <Grid item xs={6} key={card.id}>
            <GenreCard
              title={card.display_name}
              image={card.single_genre_image}
              onClick={() =>
                router.push(
                  `${PATH.ITEMS.genre(card.id.toString())}?hasStock=true`,
                )
              }
            />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 2 }}>
        {banners.map((banner, index) => (
          <BottomBanner
            key={index}
            image={banner.image_url}
            onClick={() => console.log(`Banner clicked: ${banner.url}`)}
          />
        ))}
      </Box>
    </>
  );
};
```

#### GenreCard.tsx (87行)
```typescript
export const GenreCard = ({ title, image, onClick }: GenreCardProps) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = '/images/ec/noimage.png';
  };

  return (
    <Card
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 100,
        width: '100%',
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
        bgcolor: 'white',
      }}
      onClick={onClick}
    >
      <div style={{ position: 'relative', width: 60, height: 60 }}>
        <Image
          src={image || '/images/ec/noimage.png'}
          alt={title}
          width={60}
          height={60}
          layout="responsive"
          objectFit="contain"
          unoptimized={true}
          onError={handleImageError}
        />
      </div>
      <CardContent>
        <Typography
          variant="body2"
          component="div"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
};
```

#### CarouselBanner.tsx (71行)
```typescript
export const CarouselBanner = ({ items }: CarouselBannerProps) => {
  return (
    <Carousel
      animation="slide"
      indicators={true}
      navButtonsAlwaysVisible={false}
      autoPlay={true}
      interval={5000}
      navButtonsProps={{
        style: {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          color: '#000',
        },
      }}
    >
      {items.map((item) => (
        <Paper
          key={item.id}
          elevation={0}
          sx={{
            position: 'relative',
            aspectRatio: '16/9',
            width: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${item.image || '/sample.png'})`,
              backgroundSize: 'contain',
              filter: 'blur(15px)',
              opacity: 0.7,
              zIndex: 0,
            },
          }}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="100vw"
            style={{ objectFit: 'contain' }}
            priority={true}
          />
        </Paper>
      ))}
    </Carousel>
  );
};
```

#### BottomBanner.tsx (79行)
- **下部バナー**: 追加プロモーション表示
- **クリック処理**: バナークリック時の処理
- **レスポンシブ**: フルワイドバナー

#### DetailContent.tsx (335行)
```typescript
export const DetailContent = ({ data }: Props) => {
  // nullチェックを行い、デフォルト値を設定
  const displayName = data.mycaItem.cardname ?? '-';
  const displayCardNumber = data.mycaItem.cardnumber ?? '-';
  const displayRarity = data.mycaItem.rarity ?? '-';
  const displayImageUrl = data.mycaItem.full_image_url ?? '/images/no-image.png';

  // 有効な商品のみを抽出（在庫があり、価格が設定されている商品）
  const validProducts = useMemo(
    () =>
      data.products.filter(
        (product) =>
          product.ec_stock_number > 0 &&
          product.actual_ec_sell_price !== null &&
          product.condition_option !== null,
      ),
    [data.products],
  );

  // TOPに表示する商品を選択（最も状態が良く、最も安価な商品）
  const topProduct = useMemo(() => {
    if (!hasProducts) return null;

    return validProducts.reduce((best, current) => {
      const currentHandle = current.condition_option?.handle ?? '';
      const bestHandle = best.condition_option?.handle ?? '';
      const currentPrice = current.actual_ec_sell_price ?? 0;
      const bestPrice = best.actual_ec_sell_price ?? 0;

      // 状態が良い順
      if (currentHandle < bestHandle) return current;
      // 状態が同じ場合は価格が安い方
      if (currentHandle === bestHandle)
        return currentPrice < bestPrice ? current : best;
      return best;
    }, validProducts[0]);
  }, [validProducts, hasProducts]);

  // 並び替えの状態管理 - 常に「安い順」を初期値とする
  const [sortOrder, setSortOrder] = useState<OrderKind['value']>(
    ORDER_KIND_VALUE.PRICE_ASC,
  );

  // 並び替え後の商品リスト
  const sortedProducts = useMemo(() => {
    return [...validProducts].sort((a, b) => {
      if (a.actual_ec_sell_price === null) return 1;
      if (b.actual_ec_sell_price === null) return -1;

      // 価格での並び替え
      if (sortOrder === ORDER_KIND_VALUE.PRICE_ASC) {
        return a.actual_ec_sell_price - b.actual_ec_sell_price;
      }
      if (sortOrder === ORDER_KIND_VALUE.PRICE_DESC) {
        return b.actual_ec_sell_price - a.actual_ec_sell_price;
      }

      // 状態での並び替え
      if (
        sortOrder === ORDER_KIND_VALUE.CONDITION_ASC ||
        sortOrder === ORDER_KIND_VALUE.CONDITION_DESC
      ) {
        const handleA = a.condition_option?.handle ?? '';
        const handleB = b.condition_option?.handle ?? '';
        return sortOrder === ORDER_KIND_VALUE.CONDITION_ASC
          ? handleA.localeCompare(handleB)
          : handleB.localeCompare(handleA);
      }

      return a.actual_ec_sell_price - b.actual_ec_sell_price;
    });
  }, [validProducts, sortOrder]);

  // スクロールヘッダーの表示制御
  useEffect(() => {
    const handleScroll = () => {
      if (productCardRef.current) {
        const rect = productCardRef.current.getBoundingClientRect();
        setShowScrollHeader(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* スクロールで表示させる */}
      <ProductSummaryCard
        product={{
          name: displayName,
          cardNumber: displayCardNumber,
          rarity: displayRarity,
          imageUrl: displayImageUrl,
          price: topProduct?.actual_ec_sell_price ?? null,
        }}
        isScrollHeader
        isVisible={showScrollHeader}
      />
      
      {/* メインコンテンツ */}
      <Container maxWidth="md">
        <Card sx={{ p: 2 }} ref={mainCardRef}>
          <Stack spacing={2}>
            <Typography variant="h4" fontWeight="bold">
              {displayName}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {displayCardNumber + ' ' + displayRarity}
            </Typography>
            {/* 画像表示 */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '500px',
                  aspectRatio: '1/1',
                  bgcolor: 'white',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={displayImageUrl}
                  alt={displayName}
                  fill
                  sizes="500px"
                  style={{ objectFit: 'contain' }}
                  priority={true}
                />
              </Box>
            </Box>
            
            {/* 商品情報テーブル */}
            <ItemInfoTable data={data.mycaItem} />
            
            {/* 商品一覧 */}
            <SortSelect
              value={sortOrder}
              onChange={handleSortChange}
              options={ORDER_KIND_OPTIONS}
            />
            
            {hasProducts ? (
              <Stack spacing={2}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => setIsCartNotifyOpen(true)}
                  />
                ))}
              </Stack>
            ) : (
              <Alert
                severity="info"
                icon={<ErrorOutlineOutlinedIcon />}
                title="在庫がありません"
                description="現在この商品の在庫がありません。"
              />
            )}
          </Stack>
        </Card>
      </Container>
      
      {/* モーダル */}
      <ReportModal
        open={isReportModalOpen}
        onClose={handleCloseReportModal}
        itemId={data.mycaItem.id}
      />
    </>
  );
};
```

#### ErrorHandler.tsx (19行)
```typescript
export const ErrorHandler = ({ errors }: { errors: string[] }) => {
  if (errors.length === 0) return null;
  
  return (
    <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
      {errors.map((error, index) => (
        <Typography key={index} variant="body2">
          {error}
        </Typography>
      ))}
    </Box>
  );
};
```

## サブディレクトリ構成

### components/
```
components/
├── layouts/                # レイアウトコンポーネント
├── buttons/                # ボタンコンポーネント
├── cards/                  # カードコンポーネント
├── icons/                  # アイコンコンポーネント
├── modals/                 # モーダルコンポーネント
├── selects/                # セレクトコンポーネント
├── tables/                 # テーブルコンポーネント
├── tags/                   # タグコンポーネント
└── alerts/                 # アラートコンポーネント
```

## 主要機能

### MallContent (74行)
- **トップページ**: ECサイトのメインコンテンツ
- **カルーセル**: CarouselBannerによる自動スライド
- **ジャンル表示**: 2列GridでGenreCard表示
- **バナー**: 下部プロモーションバナー

### GenreCard (87行)
- **ジャンル表示**: 高さ100pxの横長カード
- **画像処理**: エラー時の代替画像表示
- **ホバー効果**: transform: translateY(-2px)
- **テキスト処理**: 2行クランプによる省略表示

### CarouselBanner (71行)
- **自動スライド**: 5秒間隔の自動切り替え
- **背景ブラー**: ::before疑似要素でブラー背景
- **レスポンシブ**: 16:9アスペクト比
- **react-material-ui-carousel**: 外部ライブラリ使用

### DetailContent (335行)
- **商品詳細**: 335行の大型コンポーネント
- **商品フィルタリング**: 在庫・価格・状態での絞り込み
- **ソート機能**: 価格・状態での並び替え
- **スクロール制御**: スクロールヘッダーの表示制御
- **モーダル統合**: ReportModal統合
- **カート機能**: 商品追加とアラート表示

## 技術実装詳細

### 画像処理
```typescript
// GenreCard - エラー時の代替画像
const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = '/images/ec/noimage.png';
};

// Next.js Image最適化
<Image
  src={image || '/images/ec/noimage.png'}
  alt={title}
  width={60}
  height={60}
  layout="responsive"
  objectFit="contain"
  unoptimized={true}
  onError={handleImageError}
/>
```

### レスポンシブデザイン
```typescript
// Material-UI Grid システム
<Grid container spacing={1.5} sx={{ px: 1.5 }}>
  {genreCards.map((card) => (
    <Grid item xs={6} key={card.id}>
      <GenreCard />
    </Grid>
  ))}
</Grid>
```

### ホバー効果
```typescript
// GenreCard ホバーアニメーション
sx={{
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
}}
```

## 使用パターン
1. **MallContent**: トップページでジャンル・バナー表示
2. **GenreCard**: ジャンル一覧での個別ジャンル表示
3. **CarouselBanner**: メインビジュアルでのプロモーション
4. **DetailContent**: 商品詳細ページでの商品表示
5. **ErrorHandler**: API エラーの統一表示

## 関連する主要ライブラリ
- **react-material-ui-carousel**: カルーセル機能
- **Next.js Image**: 画像最適化
- **Material-UI**: UI コンポーネント
- **@mui/icons-material**: アイコン

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `layouts/`: レイアウトコンポーネント
- `cards/`: カードコンポーネント
- `modals/`: モーダルコンポーネント
- `tables/`: テーブルコンポーネント
- `selects/`: セレクトコンポーネント
- `alerts/`: アラートコンポーネント

## 開発ノート
- **画像最適化**: Next.js Image + エラーハンドリング
- **レスポンシブ**: Material-UI Grid システム活用
- **アニメーション**: CSS transition による滑らかな動作
- **大型コンポーネント**: DetailContent 335行の複雑な実装
- **外部ライブラリ**: react-material-ui-carousel の活用

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 