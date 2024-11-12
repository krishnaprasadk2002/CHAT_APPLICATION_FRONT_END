// interfaces
import { IChatWithParticipantDetails, IMessagesAndChatData } from './IChat';
import { IMessageWithSenderDetails } from "./IMessages"; 

export interface ICreateNewChatSuccessfullAPIResponse {
    message: string;
    data: IChatWithParticipantDetails;
}

export interface IGetAllChatsSuccessfullAPIResponse {
    message: string;
    data: IChatWithParticipantDetails[];
}

export interface IGetMessagessOfChatSuccessfullAPIResponse {
    message: string;
    data: IMessagesAndChatData;
}

export interface ISendMessageSuccessfullAPIResponse {
    message: string;
    data: IMessageWithSenderDetails;
}

export interface ICreateNewGroupSuccessfullAPIResponse {
    message: string;
    data: IChatWithParticipantDetails;
}