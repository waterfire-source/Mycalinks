# Hooks Documentation

このドキュメントの利用目的はどのようなhooksがあるのかを一覧で見れることです。

## Common Hooks

### useScanner

**パス**: `src/hooks/useScanner.ts`  
**目的**: バーコードスキャナーからの入力を処理するためのフック。キーボードイベントをキャプチャし、Enterキーが押されるまで入力をバッファリングします。

### useMultipleParamsAsState

**パス**: `src/hooks/useMultipleParamsAsState.ts`  
**目的**: 複数のURLクエリパラメータをReactの状態（state）のように扱うためのフック。複数のURLパラメータの読み取りと一括更新を簡単に行います。

### useParamsAsState

**パス**: `src/hooks/useParamsAsState.ts`  
**目的**: URLのクエリパラメータをReactの状態（state）のように扱うためのフック。URLパラメータの読み取りと更新を簡単に行います。

### useInfiniteLoading

**パス**: `src/hooks/useInfiniteLoading.ts`  
**目的**: 無限スクロール機能を実装するためのフック。ページ単位でデータを取得し、スクロールに応じて追加のデータを読み込みます。

### useUploadImage

**パス**: `src/hooks/useUploadImage.ts`  
**目的**: 画像をサーバーにアップロードするためのフック。アップロード状態、結果、エラー処理を管理します。

## App Hooks

### useStores

**パス**: `src/app/hooks/useStores.ts`  
**目的**: アプリケーション内の店舗（Store）データを取得し管理するためのフック。店舗一覧の取得、ローディング状態の管理を提供します。

### useEnclosedProduct

**パス**: `src/app/auth/(dashboard)/original-pack/create/hooks/useEnclosedProduct.ts`  
**目的**: オリジナルパックに封入する商品情報を管理するためのフック。封入商品の追加、削除、更新機能を提供します。

### useLossRegister

**パス**: `src/app/auth/(dashboard)/stock/loss/register/hooks/useLossRegister.ts`  
**目的**: 在庫ロス（廃棄・紛失など）の登録を管理するためのフック。ロス情報の入力と送信機能を提供します。

### useCreateOriginalPack

**パス**: `src/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useCreateOriginalPack.ts`  
**目的**: オリジナルパックの作成処理を管理するためのフック。パック情報の確認と作成APIの呼び出しを行います。

## Feature Hooks

### Account

#### useAccount

**パス**: `src/feature/account/hooks/useAccount.tsx`  
**目的**: アカウント情報を取得・管理するためのフック。ログインユーザーのアカウント情報の取得と更新機能を提供します。

#### useAccountGroup

**パス**: `src/feature/account/hooks/useAccountGroup.tsx`  
**目的**: アカウントグループ情報を取得・管理するためのフック。アカウントグループの一覧取得と操作機能を提供します。

### Arrival

#### useApplyStocking

**パス**: `src/feature/arrival/hooks/useApplyStocking.ts`  
**目的**: 入荷情報を適用するためのフック。入荷データの確定処理を行います。

#### useCancelStocking

**パス**: `src/feature/arrival/hooks/useCancelStocking.ts`  
**目的**: 入荷情報をキャンセルするためのフック。入荷データのキャンセル処理を行います。

#### useCreateStocking

**パス**: `src/feature/arrival/hooks/useCreateStocking.ts`  
**目的**: 新しい入荷情報を作成するためのフック。入荷データの作成と送信機能を提供します。

#### useListStocking

**パス**: `src/feature/arrival/hooks/useListStocking.ts`  
**目的**: 入荷情報の一覧を取得するためのフック。入荷データのリスト取得と検索機能を提供します。

#### useUpdateStocking

**パス**: `src/feature/arrival/hooks/useUpdateStocking.ts`  
**目的**: 入荷情報を更新するためのフック。既存の入荷データの更新機能を提供します。

### Cash

#### useCashChange

**パス**: `src/feature/cash/hooks/useCashChange.ts`  
**目的**: 現金の入出金を管理するためのフック。レジの現金残高の変更処理を行います。

#### useCashHistorySearch

**パス**: `src/feature/cash/hooks/useCashHistorySearch.ts`  
**目的**: 現金取引履歴を検索するためのフック。現金の入出金履歴の検索と取得機能を提供します。

### Category

#### useCategory

**パス**: `src/feature/category/hooks/useCategory.ts`  
**目的**: カテゴリ情報を管理するためのフック。商品カテゴリの取得と操作機能を提供します。

### Condition

#### useConditions

**パス**: `src/feature/condition/hooks/useConditions.ts`  
**目的**: 商品状態（コンディション）情報を管理するためのフック。商品状態の一覧取得と操作機能を提供します。

### Customer

#### useCustomer

**パス**: `src/feature/customer/hooks/useCustomer.ts`  
**目的**: 顧客情報を管理するためのフック。顧客データの取得、検索、更新機能を提供します。

### Department

#### useDepartments

**パス**: `src/feature/department/hooks/useDepartments.ts`  
**目的**: 部門情報を管理するためのフック。部門データの取得と操作機能を提供します。

### Genre

#### useAppGenre

**パス**: `src/feature/genre/hooks/useAppGenre.ts`  
**目的**: アプリケーション全体で使用するジャンル情報を管理するためのフック。ジャンルデータのグローバルな状態管理を行います。

#### useGenre

**パス**: `src/feature/genre/hooks/useGenre.ts`  
**目的**: ジャンル情報を取得・管理するためのフック。商品ジャンルの取得と操作機能を提供します。

### Item

#### useCreateItems

**パス**: `src/feature/item/hooks/useCreateItems.ts`  
**目的**: 新しいアイテムを作成するためのフック。アイテムデータの作成と送信機能を提供します。

#### useGetItem

**パス**: `src/feature/item/hooks/useGetItem.ts`  
**目的**: 特定のアイテム情報を取得するためのフック。アイテムIDに基づいてアイテムデータを取得します。

#### useIPackItems

**パス**: `src/feature/item/hooks/useIPackItems.ts`  
**目的**: パック商品に含まれるアイテム情報を取得するためのフック。パック商品の内容物データを管理します。

#### useItemSearch

**パス**: `src/feature/item/hooks/useItemSearch.ts`  
**目的**: アイテムを検索するためのフック。様々な条件でアイテムを検索する機能を提供します。

#### useItems

**パス**: `src/feature/item/hooks/useItems.ts`  
**目的**: アイテム情報を一括管理するためのフック。複数アイテムの取得と操作機能を提供します。

#### useMycaCart

**パス**: `src/feature/item/hooks/useMycaCart.ts`  
**目的**: MYCAカートを管理するためのフック。カート内のアイテム追加、削除、更新機能を提供します。

#### useMycaGenres

**パス**: `src/feature/item/hooks/useMycaGenres.ts`  
**目的**: MYCAジャンル情報を取得するためのフック。MYCA連携用のジャンルデータを管理します。

#### usePaginatedItemSearch

**パス**: `src/feature/item/hooks/usePaginatedItemSearch.ts`  
**目的**: ページネーション付きでアイテムを検索するためのフック。大量のアイテムデータを効率的に検索・表示します。

#### useSearchMycaItems

**パス**: `src/feature/item/hooks/useSearchMycaItems.ts`  
**目的**: MYCAアイテムを検索するためのフック。MYCA連携用のアイテム検索機能を提供します。

#### useUpdateItem

**パス**: `src/feature/item/hooks/useUpdateItem.ts`  
**目的**: アイテム情報を更新するためのフック。既存のアイテムデータの更新機能を提供します。

### Original Pack

#### useCreateOriginalPack

**パス**: `src/feature/originalPack/hooks/useCreateOriginalPack.ts`  
**目的**: オリジナルパックを作成するためのフック。パック商品の作成と送信機能を提供します。

#### useOriginalPackProducts

**パス**: `src/feature/originalPack/hooks/useOriginalPackProducts.ts`  
**目的**: オリジナルパックに含まれる商品を管理するためのフック。パック内商品の追加、削除、更新機能を提供します。

### Products

#### useCreateTransfer

**パス**: `src/feature/products/hooks/useCreateTransfer.ts`  
**目的**: 商品の転送（店舗間移動）を作成するためのフック。商品転送データの作成と送信機能を提供します。

#### useLIstArrivalPrice

**パス**: `src/feature/products/hooks/useLIstArrivalPrice.ts`  
**目的**: 商品の仕入れ価格リストを取得するためのフック。仕入れ価格の一覧と統計情報を提供します。

#### useNewProductSearch

**パス**: `src/feature/products/hooks/useNewProductSearch.ts`  
**目的**: 新商品を検索するためのフック。新しく追加された商品の検索機能を提供します。

#### usePaginatedProductSearch

**パス**: `src/feature/products/hooks/usePaginatedProductSearch.tsx`  
**目的**: ページネーション付きで商品を検索するためのフック。大量の商品データを効率的に検索・表示します。

#### usePostAdjustStock

**パス**: `src/feature/products/hooks/usePostAdjustStock.ts`  
**目的**: 在庫調整を行うためのフック。商品在庫数の調整と更新機能を提供します。

#### useProducts

**パス**: `src/feature/products/hooks/useProducts.ts`  
**目的**: 商品情報を一括管理するためのフック。複数商品の取得と操作機能を提供します。

#### useProductsSearch

**パス**: `src/feature/products/hooks/useProductsSearch.ts`  
**目的**: 商品を検索するためのフック。様々な条件で商品を検索する機能を提供します。

#### useRemoveTagFromProduct

**パス**: `src/feature/products/hooks/useRemoveTagFromProduct.ts`  
**目的**: 商品からタグを削除するためのフック。商品に付与されたタグの削除機能を提供します。

#### useUpdateProduct

**パス**: `src/feature/products/hooks/useUpdateProduct.ts`  
**目的**: 商品情報を更新するためのフック。既存の商品データの更新機能を提供します。

#### useWholesalePrice

**パス**: `src/feature/products/hooks/useWholesalePrice.ts`  
**目的**: 卸売価格を管理するためのフック。商品の卸売価格の取得と設定機能を提供します。

### Loss

#### useCreateLoss

**パス**: `src/feature/products/loss/hooks/useCreateLoss.ts`  
**目的**: 商品ロス（廃棄・紛失など）を登録するためのフック。ロスデータの作成と送信機能を提供します。

#### useListLossGenres

**パス**: `src/feature/products/loss/hooks/useListLossGenres.ts`  
**目的**: ロス区分のジャンル情報を取得するためのフック。ロス理由の分類データを管理します。

#### useLossItems

**パス**: `src/feature/products/loss/hooks/useLossItems.ts`  
**目的**: ロス対象アイテムを管理するためのフック。ロス登録対象のアイテムリストを操作します。

#### useStaff

**パス**: `src/feature/products/loss/hooks/useStaff.ts`  
**目的**: スタッフ情報を管理するためのフック。ロス登録時のスタッフデータを取得・設定します。

### PSA

#### useAppraisal

**パス**: `src/feature/psa/hooks/useAppraisal.ts`  
**目的**: 査定情報を管理するためのフック。商品査定データの取得と操作機能を提供します。

#### usePsaTags

**パス**: `src/feature/psa/hooks/usePsaTags.ts`  
**目的**: PSAタグ情報を管理するためのフック。PSA関連のタグデータを取得・操作します。

### Purchase

#### usePurchaseCart

**パス**: `src/feature/purchase/hooks/usePurchaseCart.ts`  
**目的**: 買取カートを管理するためのフック。買取商品のカート追加、削除、更新機能を提供します。

### Purchase Reception

#### usePurchaseTerm

**パス**: `src/feature/purchaseReception/hooks/usePurchaseTerm.tsx`  
**目的**: 買取条件を管理するためのフック。買取時の条件設定と確認機能を提供します。

#### useTransactionCart

**パス**: `src/feature/purchaseReception/hooks/useTransactionCart.tsx`  
**目的**: 取引カートを管理するためのフック。取引商品のカート操作機能を提供します。

#### useValidation

**パス**: `src/feature/purchaseReception/hooks/useValidation.tsx`  
**目的**: 入力検証を行うためのフック。フォーム入力値の検証機能を提供します。

### Sale

#### useSaleCart

**パス**: `src/feature/sale/hooks/useSaleCart.ts`  
**目的**: 販売カートを管理するためのフック。販売商品のカート追加、削除、更新機能を提供します。

### Settings

#### useCashRegister

**パス**: `src/feature/settings/cashRegister/hooks/useCashRegister.ts`  
**目的**: レジ設定を管理するためのフック。キャッシュレジスターの設定データを取得・更新します。

#### useConditions

**パス**: `src/feature/settings/condition/hooks/useConditions.ts`  
**目的**: 商品状態設定を管理するためのフック。商品コンディションの設定データを取得・更新します。

#### useTags

**パス**: `src/feature/settings/tag/hooks/useTags.ts`  
**目的**: タグ設定を管理するためのフック。商品タグの設定データを取得・更新します。

### Stock

#### useListSuppliers

**パス**: `src/feature/stock/hooks/useListSuppliers.ts`  
**目的**: 仕入先リストを取得するためのフック。仕入先データの一覧取得と検索機能を提供します。

#### useBundles

**パス**: `src/feature/stock/bundle/hooks/useBundles.ts`  
**目的**: バンドル商品を管理するためのフック。バンドル商品の取得と操作機能を提供します。

#### useEditBundleByForm

**パス**: `src/feature/stock/bundle/hooks/useEditBundleByForm.tsx`  
**目的**: フォームを使用してバンドル商品を編集するためのフック。バンドル編集フォームの状態管理を行います。

#### useEditSetByForm

**パス**: `src/feature/stock/bundle/hooks/useEditSetByForm.tsx`  
**目的**: フォームを使用してセット商品を編集するためのフック。セット編集フォームの状態管理を行います。

#### useGetBundleByParams

**パス**: `src/feature/stock/bundle/hooks/useGetBundleByParams.ts`  
**目的**: URLパラメータからバンドル商品情報を取得するためのフック。URLに含まれるバンドルIDから商品情報を取得します。

#### useGetSetDealbyParams

**パス**: `src/feature/stock/bundle/hooks/useGetSetDealbyParams.ts`  
**目的**: URLパラメータからセット商品情報を取得するためのフック。URLに含まれるセットIDから商品情報を取得します。

#### useListBundleProducts

**パス**: `src/feature/stock/bundle/hooks/useListBundleProducts.ts`  
**目的**: バンドル商品に含まれる商品リストを取得するためのフック。バンドル内商品の一覧を管理します。

#### useListSetProducts

**パス**: `src/feature/stock/bundle/hooks/useListSetProducts.ts`  
**目的**: セット商品に含まれる商品リストを取得するためのフック。セット内商品の一覧を管理します。

#### useEditBundleModal

**パス**: `src/feature/stock/bundle/components/EditBundleModal/hooks/useEditBundleModal.tsx`  
**目的**: バンドル編集モーダルを管理するためのフック。モーダル内のバンドル編集機能を提供します。

#### useBundleForm

**パス**: `src/feature/stock/bundle/register/BundleSetting/hooks/useBundleForm.tsx`  
**目的**: バンドル登録フォームを管理するためのフック。バンドル作成フォームの状態管理を行います。

#### useSale

**パス**: `src/feature/stock/sale/hooks/useSale.ts`  
**目的**: 在庫販売情報を管理するためのフック。在庫商品の販売データを取得・操作します。

#### useSetDeals

**パス**: `src/feature/stock/set/hooks/useSetDeals.ts`  
**目的**: セット商品取引を管理するためのフック。セット商品の取引データを取得・操作します。

#### useEditSetDealByForm

**パス**: `src/feature/stock/set/hooks/useEditSetDealByForm.ts`  
**目的**: フォームを使用してセット商品取引を編集するためのフック。セット取引編集フォームの状態管理を行います。

#### useSetDealForm

**パス**: `src/feature/stock/set/hooks/useSetDealForm.ts`  
**目的**: セット商品取引フォームを管理するためのフック。セット取引作成フォームの状態管理を行います。

#### useSetForm

**パス**: `src/feature/stock/set/register/SetSetting/hooks/useSetForm.tsx`  
**目的**: セット商品登録フォームを管理するためのフック。セット商品作成フォームの状態管理を行います。

### Stocking

#### useAddressSearch

**パス**: `src/feature/stocking/hooks/useAddressSearch.tsx`  
**目的**: 住所検索を行うためのフック。郵便番号から住所情報を取得する機能を提供します。

### Store

#### useAllStoreInfo

**パス**: `src/feature/store/hooks/useAllStoreInfo.ts`  
**目的**: 全店舗情報を取得するためのフック。システム内の全店舗データを一括取得します。

#### useStoreInfo

**パス**: `src/feature/store/hooks/useStoreInfo.ts`  
**目的**: 店舗情報を取得するためのフック。特定店舗の詳細情報を取得・管理します。

#### useStoreInfoNormal

**パス**: `src/feature/store/hooks/useStoreInfoNormal.ts`  
**目的**: 店舗の基本情報を取得するためのフック。店舗IDに基づいて店舗の標準的な情報を取得します。

#### useStoreStatus

**パス**: `src/feature/store/hooks/useStoreStatus.ts`  
**目的**: 店舗状態を管理するためのフック。店舗の営業状態などのステータス情報を取得・更新します。

#### useUpdateStorePointInfo

**パス**: `src/feature/store/hooks/useUpdateStorePointInfo.ts`  
**目的**: 店舗ポイント情報を更新するためのフック。店舗のポイント設定データを更新します。

### Transaction

#### useAddPoint

**パス**: `src/feature/transaction/hooks/useAddPoint.ts`  
**目的**: ポイント追加を管理するためのフック。取引時のポイント付与処理を行います。

#### useAssessmentStatus

**パス**: `src/feature/transaction/hooks/useAssessmentStatus.ts`  
**目的**: 査定状態を管理するためのフック。商品査定のステータス情報を取得・更新します。

#### useFetchTransactionDetails

**パス**: `src/feature/transaction/hooks/useFetchTransactionDetails.tsx`  
**目的**: 取引詳細を取得するためのフック。特定取引の詳細情報を取得します。

#### useListItemsWithTransaction

**パス**: `src/feature/transaction/hooks/useListItemsWithTransaction.tsx`  
**目的**: 取引に関連するアイテムリストを取得するためのフック。取引に含まれる商品一覧を管理します。

#### usePurchaseTransaction

**パス**: `src/feature/transaction/hooks/usePurchaseTransaction.ts`  
**目的**: 買取取引を管理するためのフック。買取取引データの作成と処理機能を提供します。

#### useSellTransactions

**パス**: `src/feature/transaction/hooks/useSellTransactions.ts`  
**目的**: 販売取引を管理するためのフック。販売取引データの作成と処理機能を提供します。

#### useTransaction

**パス**: `src/feature/transaction/hooks/useTransaction.ts`  
**目的**: 取引情報を管理するためのフック。取引データの取得と操作機能を提供します。

#### useTransactions

**パス**: `src/feature/transaction/hooks/useTransactions.ts`  
**目的**: 複数取引を一括管理するためのフック。取引リストの取得と検索機能を提供します。
