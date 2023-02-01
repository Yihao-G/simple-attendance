import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "../../../env/client.mjs";
import { TRPCError } from "@trpc/server";

export const checkinRouter = createTRPCRouter({
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const checkinEntities = await ctx.prisma.checkin
        .findMany({
          where: {
            userId: ctx.session.user.id
          }
        });
      return checkinEntities.map((entity) => ({
        date: entity.createdAt
      }));
    }),

  checkin: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await ctx.prisma.$transaction(async (tx) => {
        const tooFrequentCheckin = !!await tx.checkin.findFirst({
          where: {
            userId: ctx.session.user.id,
            createdAt: {
              gte: new Date(Date.now() - env.NEXT_PUBLIC_MIN_CHECKIN_INTERVAL_MS)
            }
          },
          select: {
            id: true
          }
        });
        if (tooFrequentCheckin) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already checked in recently"
          });
        }
        await tx.checkin.create({
          data: { userId: ctx.session.user.id }
        });
      });
    })
});
