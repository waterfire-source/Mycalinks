//レジマスタの拡張クエリ（DAO的な）
import { PrismaService, PrismaUtil } from '@/db/prisma';
import { Prisma } from '@prisma/client';

export const createRegisterDao = (prisma: PrismaService) => {
  const logicalDeleteWhere: Prisma.RegisterWhereInput = {
    deleted: false,
  };

  return {
    /**
     * 論理削除されていないデータを取得する
     */
    async findUniqueExists<T extends Prisma.RegisterFindUniqueArgs>(
      args: Prisma.SelectSubset<T, Prisma.RegisterFindUniqueArgs>,
    ): Promise<Prisma.RegisterGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where, logicalDeleteWhere);

      return await prisma.register.findUnique(args);
    },
    /**
     * 論理削除されていないデータを取得する
     */
    async findFirstExists<T extends Prisma.RegisterFindFirstArgs>(
      args: Prisma.SelectSubset<T, Prisma.RegisterFindFirstArgs>,
    ): Promise<Prisma.RegisterGetPayload<T> | null> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.register.findFirst(args);
    },

    /**
     * 論理削除されていないデータを取得する
     */
    async findManyExists<T extends Prisma.RegisterFindManyArgs>(
      args: Prisma.SelectSubset<T, Prisma.RegisterFindManyArgs>,
    ): Promise<Prisma.RegisterGetPayload<T>[]> {
      PrismaUtil.safeWhere(args.where!, logicalDeleteWhere);

      return await prisma.register.findMany(args);
    },
  };
};
