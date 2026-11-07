import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        // If user already exists
        const user = await ctx.db
            .query("UserTable")
            .filter((q) => q.eq(q.field("email"), args.email))
            .collect();

        if (user?.length === 0) {
            const userData = {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
            };
            // Create new user and return with generated _id
            const result = await ctx.db.insert("UserTable", userData);
            return {
                ...userData,
                _id: result,
            };
        }

        return user[0];
    },
});
