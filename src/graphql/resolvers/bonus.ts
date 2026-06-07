import { builder } from '../schema/builder';
import { NotFoundError, withErrorMapping } from '../errors';
import { requireAuth, requireTeamAccess, requireInvoiceAccess } from '../context';

// Weekly bonus queries
builder.queryFields((t) => ({
  weeklyBonus: t.field({
    type: 'JSON',
    args: {
      teamId: t.arg.id({ required: true }),
      userId: t.arg.id({ required: false }),
      weekStart: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      requireAuth(ctx);
      await requireTeamAccess(ctx, args.teamId);

      const userId = args.userId || ctx.auth.userId!;

      const weekStart = args.weekStart
        ? new Date(args.weekStart).toISOString().slice(0, 10)
        : null;

      const q = `SELECT * FROM weekly_bonus_points WHERE team_id = $1 AND user_id = $2`;
      const params: any[] = [args.teamId, userId];
      if (weekStart) {
        const q2 = q + ' AND week_start = $3 LIMIT 1';
        const res = await ctx.db.query(q2, [...params, weekStart]);
        return res.rows[0] || null;
      }

      const res = await ctx.db.query(q + ' ORDER BY week_start DESC LIMIT 10', params);
      return res.rows;
    },
  }),
}));

// Mutations for awarding/marking bonus
builder.mutationFields((t) => ({
  markBonusAwarded: t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_parent, args, ctx) => {
      requireAuth(ctx);

      // Only billing/admin/owner should award (enforced by requireInvoiceAccess)
      await requireTeamAccess(ctx, ctx.auth.teamId!);
      requireInvoiceAccess(ctx);

      return withErrorMapping(async () => {
        const existing = await ctx.db.query('SELECT * FROM weekly_bonus_points WHERE id = $1', [args.id]);
        if (!existing.rows[0]) throw new NotFoundError('Bonus record not found');

        await ctx.db.query('UPDATE weekly_bonus_points SET awarded = TRUE, updated_at = NOW() WHERE id = $1', [args.id]);
        return true;
      });
    },
  }),
}));
