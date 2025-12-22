export interface Client { id: string; name: string; email: string | null; phone: string | null; address: string | null; comments: Comment[] }
export interface Comment { id: string; text: string; author: { name: string | null }; createdAt: string }
