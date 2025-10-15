'use client';

import { useState } from 'react';
import { ContainerLayout } from '@/components/layouts/ContainerLayout';
import { Box, Tabs, Tab, Typography } from '@mui/material';

type PrivacyPolicyTab = 'shopify';

export default function EcPrivacyPolicyPage() {
  const [activeTab, setActiveTab] = useState<PrivacyPolicyTab>('shopify');

  return (
    <ContainerLayout title="外部EC連携 プライバシーポリシー">
      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* タブヘッダー */}
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
        >
          <Tab label="Shopify連携" value="shopify" />
        </Tabs>

        {/* Shopifyプライバシーポリシー */}
        {activeTab === 'shopify' && (
          <Box
            sx={{
              px: 3,
              py: 3,
              maxWidth: 1000,
              overflow: 'auto',
              flexGrow: 1,
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {`
Mycalinks 連携アプリ プライバシーポリシー
最終更新日：2025年1月24日

本プライバシーポリシー（以下「本ポリシー」）は、Mycalinksが提供する外部EC連携アプリ（以下「本アプリ」）に適用され、ECプラットフォームマーチャントのストアデータおよび、当該ストアの顧客データの取り扱いについて定めるものです。

1. 収集する情報

ストア情報
有効になっているロケーションの名称・ID、ストア名、ストアドメイン、連絡先メールアドレス、タイムゾーン など

在庫情報
商品・バリアントの名称、説明、SKU、価格（バリアント価格・比較価格等）、在庫数、在庫ロケーション、在庫更新履歴 など

注文データ
顧客名、配送先住所、メールアドレス、電話番号、購入内容（商品・数量・単価）、割引・税額・送料・合計金額、支払い方法の種別・ステータス、注文作成日時・支払い日時・フルフィルメント情報 など

※本アプリは完全なクレジットカード番号や CVV などの機微な決済情報にはアクセスしません。

2. 利用目的

・在庫数や在庫価格の同期機能を提供するため
・注文情報を Mycalinks POS システムと連携し、POS 側で注文を一元管理できるようにするため
・上記に付随するサポート対応・障害対応・品質改善・不正利用防止・統計分析（匿名化・集計化）のため

3. API アクセス権限（スコープ）

本アプリは以下のスコープを利用します。不要な権限は要求しません。
read_products
write_products
read_inventory
write_inventory
read_locations
read_orders

※インストール時の OAuth 画面に表示される権限が最終的に適用されます。

4. 情報の共有・第三者提供

取得したデータは当社サーバーに保存され、第三者に販売・共有されることはありません。
ただし、法令等に基づく正当な要請がある場合には、必要な範囲で開示することがあります。

5. データの保持と削除

マーチャントが本アプリをアンインストールした場合、すべての関連データは30日以内に削除します（バックアップ領域についてはローテーション後に完全削除）。
GDPR Webhook（customers/data_request・customers/redact・shop/redact）に準拠し、削除・提供リクエストがあった場合は速やかに対応します。
マーチャントからの個別依頼によるデータ削除・訂正にも、合理的な範囲で対応します。

6. セキュリティ

通信の暗号化
データ送受信は TLS で保護します。

アクセス制御
最小権限原則（RBAC）に基づき、必要最小限の権限のみを付与します。

保存データの保護
サーバー側での適切な保護・監査ログの保持・アクセス監視を実施します。

バックアップ/復旧
定期バックアップと復旧手順を整備し、障害発生時の継続性を確保します。

インシデント対応
不正アクセス等が疑われる場合は即時に調査・封じ込め・影響評価・再発防止策を講じます。

7. ユーザー（データ主体）の権利

マーチャント（および法令が許容する範囲の顧客）は、当社が保有する個人データに関して以下を請求できます。
・開示（アクセス）
・訂正・削除・処理の制限
・データポータビリティ
・同意の撤回（撤回前の処理の適法性は影響を受けません）
・自動化された処理やプロファイリングに対する異議申立て

これらの請求は、本人確認のうえ、合理的な期間内に対応します。

8. クッキー等の利用

本アプリ（および管理画面）は、ログインセッション維持や CSRF 対策など、必要な範囲で Cookie を使用する場合があります。
行動ターゲティング広告目的の Cookie は使用しません。
アクセス統計を取得する場合は、IP マスキングや集計化などプライバシー配慮設定を採用します。

9. 国際的なデータ移転

データは、当社または委託先が所在する国・地域で処理される場合があります。
移転に際しては、適用法令に基づく適切な保護措置（例：標準契約条項の締結等）を講じます。

10. 児童の個人情報

本アプリは16歳未満の児童を対象としていません。
そのような情報を意図せず取得したことが判明した場合は、速やかに削除します。

11. 本ポリシーの改定

法令変更やサービス内容の更新に応じて本ポリシーを改定することがあります。
重要な変更は、本アプリの管理画面または当社ウェブサイトで通知します。
改定後は公表日から適用されます。

12. 連絡先

お問い合わせ: info@myca.cards
対応言語: 日本語 / 英語（平日営業時間内）

付記（コンプライアンス補足）
・必要最小限のデータのみを取得・保持し、目的外利用は行いません。
・個人データの「販売」は行いません（CCPA/CPRA における "Sell/Share" 行為は実施しません）。
・データの消去・提供等のリクエストは、合理的な期間内に対応します。
`}
            </Typography>
          </Box>
        )}
      </Box>
    </ContainerLayout>
  );
}
