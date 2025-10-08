import { BackendAPI } from '@/api/backendApi/main';
import { Prisma } from '@prisma/client';
import { getEcOrderStoreContactApi } from 'api-generator';

//ECオーダー用のお問い合わせ取得（店用）
export const GET = BackendAPI.create(
  getEcOrderStoreContactApi,
  async (API, { query, params }) => {
    const { code, kind, status, order_id } = query;

    const whereInput: Prisma.Ec_Order_Cart_Store_ContactWhereInput[] = [];

    Object.entries(query).forEach(([key, value]) => {
      switch (key) {
        case 'code':
          whereInput.push({
            order_store: {
              code,
            },
          });
          break;
        case 'kind':
          whereInput.push({ kind });
          break;
        case 'order_id':
          whereInput.push({
            order_store: {
              order_id,
            },
          });
          break;
        case 'status':
          whereInput.push({ status });
          break;
      }
    });

    const orderBy: Prisma.Ec_Order_Cart_Store_ContactOrderByWithRelationInput[] =
      [];
    API.orderByQuery.forEach((e) => {
      Object.entries(e).forEach(([key, value]) => {
        switch (key) {
          case 'last_sent_at':
            orderBy.push({ last_sent_at: value });
            break;

          case 'order_id':
            orderBy.push({ order_store: { order_id: value } });
            break;
        }
      });
    });

    const orderContacts = await API.db.ec_Order_Cart_Store_Contact.findMany({
      where: {
        AND: whereInput,
        order_store: {
          store_id: params.store_id,
        },
      },
      orderBy,
      ...API.limitQuery,
      include: {
        order_store: {
          select: {
            order: {
              select: {
                id: true,
                code: true,
              },
            },
            code: true,
          },
        },
        messages: {
          select: {
            id: true,
            ...(query.includesMessages && { content: true }),
            created_at: true,
            myca_user_id: true,
            staff_account_id: true,
          },
        },
      },
    });

    //メッセージだけ新しい順に並び替える
    orderContacts.forEach((e) => {
      e.messages.sort((a, b) => {
        return b.created_at.getTime() - a.created_at.getTime();
      });
    });

    return {
      orderContacts,
    };
  },
);
