// import { BackendAPI, ResponseMsgKind } from '@/api/BackendAPI/main';
import { customJwtType } from '@/types/BackendAPI';
import NextAuth, { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CustomCrypto } from '@/utils/crypto';
import { Account, Register, Store } from '@prisma/client';
import { PosRunMode, SessionUser } from '@/types/next-auth';
import { BackendApiAuthService } from '@/api/backendApi/auth/main';
import { getPrisma } from 'backend-core';

const handler = NextAuth({
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        mode: { label: 'Mode', type: 'text' },
        store_id: { label: 'StoreId', type: 'number' },
        register_id: { label: 'StoreId', type: 'number' },
      },
      //@ts-expect-error becuase of because of
      async authorize({
        email,
        password,
        mode,
        store_id,
        register_id,
      }: {
        email: Account['email'];
        password: string;
        mode: PosRunMode;
        store_id?: Store['id'];
        register_id?: Register['id'] | null;
      }) {
        console.log('リクエストはきてる');

        const db = getPrisma();
        register_id = Number(register_id) <= 0 ? null : Number(register_id);

        try {
          if (!email || !password || !mode) throw new Error();
          if (mode == PosRunMode.sales && !store_id) throw new Error();

          let thisAccount = await db.account.findUniqueExists({
            where: {
              email,
            },
            select: {
              id: true,
              email: true,
              code: true,
              hashed_password: true,
              salt: true,
              linked_corporation_id: true,
              login_flg: true,
              display_name: true,
            },
          });

          if (!thisAccount) {
            throw new Error('No account found with the provided credentials.');
          }

          const user: Record<string, unknown> = {
            id: thisAccount.id,
            corporation_id: thisAccount.linked_corporation_id,
            mode,
            email: thisAccount.email,
            display_name: thisAccount.display_name,
            isGod: false,
          };

          //login_flg=falseな特殊アカウントだった場合、パスワードを設定する
          if (
            !thisAccount.login_flg &&
            !thisAccount.code &&
            mode == PosRunMode.admin
          ) {
            const { hash, salt } = CustomCrypto.generateHash(password);

            thisAccount = await db.account.update({
              where: {
                id: thisAccount.id,
              },
              data: {
                hashed_password: hash,
                salt,
                login_flg: true,
              },
            });

            return user;
          } else {
            //そうじゃない場合、launchを実行
            const launchResult = await BackendApiAuthService.launch(
              db,
              email,
              password,
            );

            console.log(launchResult);

            user.isGod = launchResult.isGod;

            if (mode == PosRunMode.admin) {
              //管理モードだったら
              if (!launchResult.availableModes.includes(PosRunMode.admin))
                throw new Error();

              return user;
            } else if (mode == PosRunMode.sales) {
              //営業モードだったら
              if (!launchResult.availableModes.includes(PosRunMode.sales))
                throw new Error();

              //指定されているstore_idが適切か判断
              const thisStoreInfo = launchResult.account.stores.find(
                (e) => e.store.id == store_id,
              );

              if (!thisStoreInfo) throw new Error();

              user.store_id = store_id;

              if (register_id) {
                const thisRegisterInfo = thisStoreInfo.store.registers.find(
                  (e) => e.id == register_id,
                );
                if (!thisRegisterInfo) throw new Error();

                user.register_id = register_id;
              }

              return user;
            }

            throw new Error();
          }
        } catch (e: any) {
          console.error('Failed to authorize user:', e.message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    //@ts-expect-error becuase of because of
    async jwt({ token, user }: { token: JWT; user: SessionUser }) {
      if (user) {
        token.corporation_id = user.corporation_id;
        token.store_id = user.store_id;
        token.register_id = user.register_id;
        token.mode = user.mode;
        token.email = user.email;
        token.display_name = user.display_name;
        token.isGod = user.isGod;
      }

      return token;
    },

    // @ts-expect-error because of because
    session({ session, token }: { session: Session; token: customJwtType }) {
      if (token.sub) {
        session.user = {
          id: Number(token.sub),
          corporation_id: Number(token.corporation_id),
          store_id: token?.store_id ? Number(token?.store_id) : undefined,
          register_id: token?.register_id
            ? Number(token?.register_id)
            : undefined,
          mode: token?.mode,
          email: token.email,
          display_name: token.display_name,
          isGod: token.isGod,
        };
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };
