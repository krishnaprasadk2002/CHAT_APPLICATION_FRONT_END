import { User } from "./IUser";

export interface IMessage {
    _id?: string;
    chatId: string;
    senderId: string;
    receiverId: string;
    message: string; 
    file?: {
        key: string;
        url: string;
    };
    type: "text" |'image' | 'video' | 'audio' | 'document';
    isRead: boolean;
    createdAt: Date;
}


export interface IMessageWithSenderDetails extends IMessage {
    senderData: User;
}

export interface IMessagesGroupedByDate {
    createdAt: Date;
    messages: IMessageWithSenderDetails[];
}