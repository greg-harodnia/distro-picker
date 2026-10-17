import type { LikeDelta } from '$lib/supabase';

export interface LikeSnapshot {
	liked: boolean;
	count: number;
}

export interface LikeActions {
	/** Render a snapshot (the optimistic flip, then the reconciled one). */
	apply: (snapshot: LikeSnapshot) => void;
	/** Record the like locally — only called once the server confirms it. */
	remember: (liked: boolean) => void;
	/** Apply the delta server-side; resolves to the new count, or `null` when unreachable. */
	rpc: (delta: LikeDelta) => Promise<number | null>;
}

/**
 * Optimistically flips a like, then reconciles with the server. A *delta* is
 * sent rather than an absolute count, so the database can apply it with a
 * single atomic UPDATE and concurrent likers can't overwrite each other.
 *
 * The local record is written only after the server confirms, so an unreachable
 * backend never leaves a phantom "liked" behind. Shared by the distro and blog
 * like buttons, which keep identical semantics but different state (a global
 * store vs. local component state) and storage keys.
 */
export async function toggleLike(
	current: LikeSnapshot,
	{ apply, remember, rpc }: LikeActions
): Promise<void> {
	const liked = !current.liked;
	const delta: LikeDelta = liked ? 1 : -1;
	const optimistic = Math.max(0, current.count + delta);

	apply({ liked, count: optimistic });

	const serverCount = await rpc(delta);
	if (serverCount === null) {
		apply(current); // server unreachable — undo the optimistic flip
		return;
	}

	remember(liked);
	// Another liker may have beaten us; adopt the authoritative count.
	if (serverCount !== optimistic) apply({ liked, count: serverCount });
}
