import { AccountAPI } from '@/api/frontend/account/api';
import { CustomerAPI } from '@/api/frontend/customer/api';
import { InventoryAPI } from '@/api/frontend/inventory/api';
import { ItemAPI } from '@/api/frontend/item/api';
import { LossAPI } from '@/api/frontend/loss/api';
import { MycaAppAPI } from '@/api/frontend/mycaApp/api';
import { ProductAPI } from '@/api/frontend/product/api';
import { SaleAPI } from '@/api/frontend/sale/api';
import { StockingAPI } from '@/api/frontend/stocking/api';
import { StoreAPI } from '@/api/frontend/store/api';
import { TransactionAPI } from '@/api/frontend/transaction/api';
import { CorporationAPI } from '@/api/frontend/corporation/api';
import { AppraisalAPI } from '@/api/frontend/appraisal/api';
import { CategoryAPI } from '@/api/frontend/category/api';
import { GenreAPI } from '@/api/frontend/genre/api';
import { ConditionOptionAPI } from '@/api/frontend/conditionOption/api';
import { SquareAPI } from '@/api/frontend/square/api';
import { AccountGroupAPI } from '@/api/frontend/accountGroup/api';
import { MemoAPI } from '@/api/frontend/memo/api';
import { EcAPI } from '@/api/frontend/ec/api';
import { AuthAPI } from '@/api/frontend/auth/api';
import { MycalinksTransactionAPI } from '@/api/frontend/mycalinks/transaction/api';
import { MyPageCustomerAPI } from '@/api/frontend/mycalinks/myPage/api';
import { ConsignmentAPI } from '@/api/frontend/consignment/api';
export interface ClientAPI {
  item: {
    getAll(
      request: ItemAPI['getAll']['request'],
    ): Promise<ItemAPI['getAll']['response']>;
    create(
      request: ItemAPI['create']['request'],
    ): Promise<ItemAPI['create']['response']>;
    getPackItem(
      request: ItemAPI['getPackItem']['request'],
    ): Promise<ItemAPI['getPackItem']['response']>;
    createOriginalPack(
      request: ItemAPI['createOriginalPack']['request'],
    ): Promise<ItemAPI['createOriginalPack']['response']>;
    createBundle(
      request: ItemAPI['createBundle']['request'],
    ): Promise<ItemAPI['createBundle']['response']>;
    importItemsFromApp(
      request: ItemAPI['importItemsFromApp']['request'],
    ): Promise<ItemAPI['importItemsFromApp']['response']>;
    createAllItemsFromPack(
      request: ItemAPI['createAllItemsFromPack']['request'],
    ): Promise<ItemAPI['createAllItemsFromPack']['response']>;
  };
  store: {
    getAll(): Promise<StoreAPI['getAll']['response']>;
    getStoreInfo(
      request: StoreAPI['getStoreInfo']['request'],
    ): Promise<StoreAPI['getStoreInfo']['response']>;
    updateStoreInfo(
      request: StoreAPI['updateStoreInfo']['request'],
    ): Promise<StoreAPI['updateStoreInfo']['response']>;
    getRegisterDetails(
      request: StoreAPI['getRegisterDetails']['request'],
    ): Promise<StoreAPI['getRegisterDetails']['response']>;
    getTerm(
      request: StoreAPI['getTerm']['request'],
    ): Promise<StoreAPI['getTerm']['response']>;
    updateTerm(
      request: StoreAPI['updateTerm']['request'],
    ): Promise<StoreAPI['updateTerm']['response']>;
    updateWholesalePrice(
      request: StoreAPI['updateWholesalePrice']['request'],
    ): Promise<StoreAPI['updateWholesalePrice']['response']>;
    postRegister(
      request: StoreAPI['postRegister']['request'],
    ): Promise<StoreAPI['postRegister']['response']>;
    getTabletAllowedGenresCategories(
      request: StoreAPI['getTabletAllowedGenresCategories']['request'],
    ): Promise<StoreAPI['getTabletAllowedGenresCategories']['response']>;
    setTabletAllowedGenresCategories(
      request: StoreAPI['setTabletAllowedGenresCategories']['request'],
    ): Promise<StoreAPI['setTabletAllowedGenresCategories']['response']>;
    getItemMarketPriceHistory(): Promise<
      StoreAPI['getItemMarketPriceHistory']['response']
    >;
    adjustItemsWithMarketPriceGap(
      request: StoreAPI['adjustItemsWithMarketPriceGap']['request'],
    ): Promise<StoreAPI['adjustItemsWithMarketPriceGap']['response']>;
    getEcOrderDeliveryNote(
      request: StoreAPI['getEcOrderDeliveryNote']['request'],
    ): Promise<StoreAPI['getEcOrderDeliveryNote']['response']>;
  };
  product: {
    listProducts(
      request: ProductAPI['listProducts']['request'],
    ): Promise<ProductAPI['listProducts']['response']>;
    updateProduct(
      request: ProductAPI['updateProduct']['request'],
    ): Promise<ProductAPI['updateProduct']['response']>;
    getProductHistory(
      request: ProductAPI['getProductHistory']['request'],
    ): Promise<ProductAPI['getProductHistory']['response']>;
    createTransfer(
      request: ProductAPI['createTransfer']['request'],
    ): Promise<ProductAPI['createTransfer']['response']>;
    createSale(
      request: ProductAPI['createSale']['request'],
    ): Promise<ProductAPI['createSale']['response']>;
    getSales(
      request: ProductAPI['getSales']['request'],
    ): Promise<ProductAPI['getSales']['response']>;
    createPackedProduct(
      request: ProductAPI['createPackedProduct']['request'],
    ): Promise<ProductAPI['createPackedProduct']['response']>;
    getWholesalePrice(
      request: ProductAPI['getWholesalePrice']['request'],
    ): Promise<ProductAPI['getWholesalePrice']['response']>;
    disassemblyOriginalPack(
      request: ProductAPI['disassemblyOriginalPack']['request'],
    ): Promise<ProductAPI['disassemblyOriginalPack']['response']>;
    releaseBundle(
      request: ProductAPI['releaseBundle']['request'],
    ): Promise<ProductAPI['releaseBundle']['response']>;
    createSetDeal(
      request: ProductAPI['createSetDeal']['request'],
    ): Promise<ProductAPI['createSetDeal']['response']>;
    updateSetDeal(
      request: ProductAPI['updateSetDeal']['request'],
    ): Promise<ProductAPI['updateSetDeal']['response']>;
    deleteSetDeal(
      request: ProductAPI['deleteSetDeal']['request'],
    ): Promise<ProductAPI['deleteSetDeal']['response']>;
    listSetDeals(
      request: ProductAPI['listSetDeals']['request'],
    ): Promise<ProductAPI['listSetDeals']['response']>;
    createTag(
      request: ProductAPI['createTag']['request'],
    ): Promise<ProductAPI['createTag']['response']>;
    updateTag(
      request: ProductAPI['updateTag']['request'],
    ): Promise<ProductAPI['updateTag']['response']>;
    deleteTag(
      request: ProductAPI['deleteTag']['request'],
    ): Promise<ProductAPI['deleteTag']['response']>;
    getTags(
      request: ProductAPI['getTags']['request'],
    ): Promise<ProductAPI['getTags']['response']>;
    addTagToProduct(
      request: ProductAPI['addTagToProduct']['request'],
    ): Promise<ProductAPI['addTagToProduct']['response']>;
    removeTagFromProduct(
      request: ProductAPI['removeTagFromProduct']['request'],
    ): Promise<ProductAPI['removeTagFromProduct']['response']>;
  };
  loss: {
    createLoss(
      request: LossAPI['createLoss']['request'],
    ): Promise<LossAPI['createLoss']['response']>;
    createLossGenre(
      request: LossAPI['createLossGenre']['request'],
    ): Promise<LossAPI['createLossGenre']['response']>;
    getItems(
      request: LossAPI['getItems']['request'],
    ): Promise<LossAPI['getItems']['response']>;
    getLossGenres(
      request: LossAPI['getLossGenres']['request'],
    ): Promise<LossAPI['getLossGenres']['response']>;
    deleteLossGenre(
      request: LossAPI['deleteLossGenre']['request'],
    ): Promise<LossAPI['deleteLossGenre']['response']>;
  };
  transaction: {
    create(
      request: TransactionAPI['create']['request'],
    ): Promise<TransactionAPI['create']['response']>;
    getTransactionDetails(
      request: TransactionAPI['getTransactionDetails']['request'],
    ): Promise<TransactionAPI['getTransactionDetails']['response']>;
    listTransactions(
      request: TransactionAPI['listTransactions']['request'],
    ): Promise<TransactionAPI['listTransactions']['response']>;
    processReturn(
      request: TransactionAPI['processReturn']['request'],
    ): Promise<TransactionAPI['processReturn']['response']>;
    getAssessmentList(
      request: TransactionAPI['getAssessmentList']['request'],
    ): Promise<TransactionAPI['getAssessmentList']['response']>;
  };
  customer: {
    createGuestCustomer(
      request: CustomerAPI['createGuestCustomer']['request'],
    ): Promise<CustomerAPI['createGuestCustomer']['response']>;
  };
  accountGroup: {
    listAllAccountGroups(): Promise<
      AccountGroupAPI['listAllAccountGroups']['response']
    >;
    deleteAccountGroup(
      request: AccountGroupAPI['deleteAccountGroup']['request'],
    ): Promise<AccountGroupAPI['deleteAccountGroup']['response']>;
    createAccountGroup(
      request: AccountGroupAPI['createAccountGroup']['request'],
    ): Promise<AccountGroupAPI['createAccountGroup']['response']>;
    updateAccountGroup(
      request: AccountGroupAPI['updateAccountGroup']['request'],
    ): Promise<AccountGroupAPI['updateAccountGroup']['response']>;
  };
  account: {
    listAllAccounts(): Promise<AccountAPI['listAllAccounts']['response']>;
    getAccountById(
      request: AccountAPI['getAccountById']['request'],
    ): Promise<AccountAPI['getAccountById']['response']>;
    createAccount(
      request: AccountAPI['createAccount']['request'],
    ): Promise<AccountAPI['createAccount']['response']>;
    updateAccount(
      request: AccountAPI['updateAccount']['request'],
    ): Promise<AccountAPI['updateAccount']['response']>;
    updateStaffCode(
      request: AccountAPI['updateStaffCode']['request'],
    ): Promise<AccountAPI['updateStaffCode']['response']>;
    deleteAccount(
      request: AccountAPI['deleteAccount']['request'],
    ): Promise<AccountAPI['deleteAccount']['response']>;
  };
  stocking: {
    createStocking(
      request: StockingAPI['createStocking']['request'],
    ): Promise<StockingAPI['createStocking']['response']>;
    applyStocking(
      request: StockingAPI['applyStocking']['request'],
    ): Promise<StockingAPI['applyStocking']['response']>;
    cancelStocking(
      request: StockingAPI['cancelStocking']['request'],
    ): Promise<StockingAPI['cancelStocking']['response']>;
    listStocking(
      request: StockingAPI['listStocking']['request'],
    ): Promise<StockingAPI['listStocking']['response']>;
    createStockingSupplier(
      request: StockingAPI['createStockingSupplier']['request'],
    ): Promise<StockingAPI['createStockingSupplier']['response']>;
    updateStockingSupplier(
      request: StockingAPI['updateStockingSupplier']['request'],
    ): Promise<StockingAPI['updateStockingSupplier']['response']>;
    listStockingSupplier(
      request: StockingAPI['listStockingSupplier']['request'],
    ): Promise<StockingAPI['listStockingSupplier']['response']>;
    deleteStockingSupplier(
      request: StockingAPI['deleteStockingSupplier']['request'],
    ): Promise<StockingAPI['deleteStockingSupplier']['response']>;
  };
  sale: {
    createSale(
      request: SaleAPI['createSale']['request'],
    ): Promise<SaleAPI['createSale']['response']>;
    updateSale(
      request: SaleAPI['updateSale']['request'],
    ): Promise<SaleAPI['updateSale']['response']>;
    deleteSale(
      request: SaleAPI['deleteSale']['request'],
    ): Promise<SaleAPI['deleteSale']['response']>;
    getSales(
      request: SaleAPI['getSales']['request'],
    ): Promise<SaleAPI['getSales']['response']>;
  };
  inventory: {
    getInventories(
      request: InventoryAPI['getInventories']['request'],
    ): Promise<InventoryAPI['getInventories']['response']>;
    deleteInventory(
      request: InventoryAPI['deleteInventory']['request'],
    ): Promise<InventoryAPI['deleteInventory']['response']>;
    applyInventory(
      request: InventoryAPI['applyInventory']['request'],
    ): Promise<InventoryAPI['applyInventory']['response']>;
    createOrUpdateShelf(
      request: InventoryAPI['createOrUpdateShelf']['request'],
    ): Promise<InventoryAPI['createOrUpdateShelf']['response']>;
    getShelfs(
      request: InventoryAPI['getShelfs']['request'],
    ): Promise<InventoryAPI['getShelfs']['response']>;
    deleteShelf(
      request: InventoryAPI['deleteShelf']['request'],
    ): Promise<InventoryAPI['deleteShelf']['response']>;
  };
  corporation: {
    updateCorporation(
      request: CorporationAPI['updateCorporation']['request'],
    ): Promise<CorporationAPI['updateCorporation']['response']>;
  };
  mycaApp: {
    getItem(
      request: MycaAppAPI['getItem']['request'],
    ): Promise<MycaAppAPI['getItem']['response']>;
  };
  appraisal: {
    getAppraisal(
      request: AppraisalAPI['getAppraisal']['request'],
    ): Promise<AppraisalAPI['getAppraisal']['response']>;
    createAppraisal(
      request: AppraisalAPI['createAppraisal']['request'],
    ): Promise<AppraisalAPI['createAppraisal']['response']>;
    inputAppraisalResult(
      request: AppraisalAPI['inputAppraisalResult']['request'],
    ): Promise<AppraisalAPI['inputAppraisalResult']['response']>;
  };
  category: {
    getCategoryAll(
      request: CategoryAPI['getCategoryAll']['request'],
    ): Promise<CategoryAPI['getCategoryAll']['response']>;
  };
  genre: {
    getGenreAll(
      request: GenreAPI['getGenreAll']['request'],
    ): Promise<GenreAPI['getGenreAll']['response']>;
    createGenre(
      request: GenreAPI['createGenre']['request'],
    ): Promise<GenreAPI['createGenre']['response']>;
    createMycaGenre(
      request: GenreAPI['createMycaGenre']['request'],
    ): Promise<GenreAPI['createMycaGenre']['response']>;
    getAppGenreAll(
      request: GenreAPI['getAppGenreAll']['request'],
    ): Promise<GenreAPI['getAppGenreAll']['response']>;
  };
  memo: {
    getAll(
      request: MemoAPI['getAll']['request'],
    ): Promise<MemoAPI['getAll']['response']>;
    createMemo(
      request: MemoAPI['createMemo']['request'],
    ): Promise<MemoAPI['createMemo']['response']>;
    updateMemo(
      request: MemoAPI['updateMemo']['request'],
    ): Promise<MemoAPI['updateMemo']['response']>;
    deleteMemo(
      request: MemoAPI['deleteMemo']['request'],
    ): Promise<MemoAPI['deleteMemo']['response']>;
  };
  conditionOption: {
    createConditionOption(
      request: ConditionOptionAPI['createConditionOption']['request'],
    ): Promise<ConditionOptionAPI['createConditionOption']['response']>;
  };
  ec: {
    getEcBanner(
      request: EcAPI['getEcBanner']['request'],
    ): Promise<EcAPI['getEcBanner']['response']>;
    getEcGenre(
      request: EcAPI['getEcGenre']['request'],
    ): Promise<EcAPI['getEcGenre']['response']>;
    getEcItem(
      request: EcAPI['getEcItem']['request'],
    ): Promise<EcAPI['getEcItem']['response']>;
    submitEcContact(
      request: EcAPI['submitEcContact']['request'],
    ): Promise<EcAPI['submitEcContact']['response']>;
    getEcProduct(
      request: EcAPI['getEcProduct']['request'],
    ): Promise<EcAPI['getEcProduct']['response']>;
    createOrUpdateEcOrder(
      request: EcAPI['createOrUpdateEcOrder']['request'],
    ): Promise<EcAPI['createOrUpdateEcOrder']['response']>;
    payEcOrder(
      request: EcAPI['payEcOrder']['request'],
    ): Promise<EcAPI['payEcOrder']['response']>;
    getEcOrder(
      request: EcAPI['getEcOrder']['request'],
    ): Promise<EcAPI['getEcOrder']['response']>;
  };
  square: {
    getSquareOAuthUrl(
      request: SquareAPI['getSquareOAuthUrl']['request'],
    ): Promise<SquareAPI['getSquareOAuthUrl']['response']>;
  };
  auth: {
    launch(
      request: AuthAPI['launch']['request'],
    ): Promise<AuthAPI['launch']['response']>;
  };
  mycalinksTransaction: {
    getAll(): Promise<MycalinksTransactionAPI['getAll']['response']>;
  };
  myPageCustomer: {
    getAllCustomer(): Promise<MyPageCustomerAPI['getAll']['response']>;
  };
  consignment: {
    createOrUpdateConsignmentClient(
      request: ConsignmentAPI['createOrUpdateConsignmentClient']['request'],
    ): Promise<ConsignmentAPI['createOrUpdateConsignmentClient']['response']>;
    getConsignmentClient(
      request: ConsignmentAPI['getConsignmentClient']['request'],
    ): Promise<ConsignmentAPI['getConsignmentClient']['response']>;
    deleteConsignmentClient(
      request: ConsignmentAPI['deleteConsignmentClient']['request'],
    ): Promise<ConsignmentAPI['deleteConsignmentClient']['response']>;
    stockConsignmentClientProduct(
      request: ConsignmentAPI['stockConsignmentClientProduct']['request'],
    ): Promise<ConsignmentAPI['stockConsignmentClientProduct']['response']>;
  };
}
