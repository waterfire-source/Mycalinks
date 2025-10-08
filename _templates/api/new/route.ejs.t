---
inject: true
to: packages/web-app/src/app/api<%= path.replaceAll('{', '[').replaceAll('}', ']') %>/route.ts
append: true
---


// <%= summary %>

<% if (method === 'GET') { %>
export const GET = BackendAPI.create(
  <%= operationName %>Api,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.RegisterWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'status':
          whereInput.push({
            [key]: value as ReservationStatus,
          });
      }
    });

    const selectRes = await API.db.register.findManyExists({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
    });

    return {
      registers: selectRes,
    };
  },
);

<% } else if (method === 'POST') { %>
export const POST = BackendAPI.create(
  <%= operationName %>Api,
  async (API, { params, body }) => {
    const { store_id } = params;

    let {
      id,
    } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');


    if (id) {
      const alreadyInfo = await API.db.item.findUniqueExists({
        where: {
          id,
          store_id,
        },
      });

      if (!alreadyInfo) throw new ApiError('notExist');
    }

    const txResult = await API.transaction(async (tx) => {
      const createItemRes = await tx.item.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
        },
        update: {
        },
      });

      const thisItem = new BackendApiItemService(API, createItemRes.id);

      if (!id) {
        const productIds = await thisItem.core.createProducts({
          needIds: true,
        });

        if (!productIds.length)
          throw new ApiError({
            status: 500,
            messageText: '正常に在庫が作成されませんでした',
          });
      }

      else {
        await thisItem.core.bundle.edit({
          newProducts: products,
        });

        createItemRes.bundle_item_products = products.map((e) => ({
          ...e,
          item_id: createItemRes.id,
        }));
      }

      const itemModel = new BackendApiItemService(API, createItemRes.id);
      await itemModel.core.bundle.updateStatus({
        storeId: store_id,
        itemId: createItemRes.id,
      });

      return createItemRes;
    });

    return txResult;
  },
);

<% } else if (method === 'PUT') { %>
export const PUT = BackendAPI.create(
  <%= operationName %>Api,
  async (API, { params, body }) => {
    const { memo } = body;

    const thisCustomerInfo = await API.db.customer.findUnique({
      where: {
        id: params.customer_id,
        store_id: params.store_id,
      },
    });

    if (!thisCustomerInfo) throw new ApiError('notExist');

    const updateRes = await API.db.customer.update({
      where: {
        id: params.customer_id,
        store_id: params.store_id,
      },
      data: { memo },
    });

    return {
      customer: updateRes,
    };
  },
);

<% } else if (method === 'DELETE') { %>
export const DELETE = BackendAPI.create(
  <%= operationName %>Api,
  async (API, { params }) => {

    await API.db.register.update({
      where: {
        id: currentInfo.id,
      },
      data: {
        deleted: true,
      },
    });
  },
);

<% } %>
