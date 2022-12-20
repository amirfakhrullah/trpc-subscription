import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import { z } from "zod";

interface Post {
  id: string;
  text: string;
}

const ee = new EventEmitter();

const t = initTRPC.create();

export const appRouter = t.router({
  onAdd: t.procedure.subscription(() => {
    return observable<Post>((emit) => {
      const onAdd = (data: Post) => {
        emit.next(data);
      };

      ee.on("add", onAdd);

      return () => {
        ee.off("add", onAdd);
      };
    });
  }),
  add: t.procedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const post = { ...input };
      
      ee.emit("add", post);
      return post;
    }),
});
