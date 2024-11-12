// interfaces
import { IMessage, IMessagesGroupedByDate, IMessageWithSenderDetails } from "./IMessages";
import { User } from "./IUser";


export interface IChat {
    _id: string;
    chatId: string;
    participants: string[];
    type: "one-to-one" | "group";
    groupName?: string;
    groupProfilePicture?: {
        key: string | null,
        url: string
    };
    groupAdmin?: string;
    lastMessage: string;
    createdAt: Date;
}

export interface IChatWithParticipantDetails extends IChat {
    [x: string]: any;
    participantsData: User[];
    lastMessageData: IMessage;
    unReadMessages: number;
}

export interface IMessagesAndChatData {
    messages: IMessagesGroupedByDate[];
    chat: IChatWithParticipantDetails;
}