import { Http, Response, Headers } from "@angular/http";
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import 'rxjs/Rx';
import { Observable } from "rxjs";

import { Message } from "./message.model";
import { ErrorService } from "../errors/error.service";
import {backendURL} from '../shared/baseurls';

@Injectable()
export class MessageService {
    private messages: Message[] = [];
    messageIsEdit = new EventEmitter<Message>();

    constructor(private http: Http, private errorService: ErrorService, private httpClient: HttpClient) {
    }

    addMessage(message: Message) {
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-Type': 'application/json'});
        const token = localStorage.getItem('token')
            ? '?token=' + localStorage.getItem('token')
            : '';

        return this.httpClient.post<Message>(backendURL + 'message' + token, message)
            .map((data: any) => {
            const myMessage = new Message(data.obj.content,
                data.obj.user.firstName,
                data.obj._id,
                data.obj.user._id);
            this.messages.push(myMessage);
            return myMessage;
            })
            .catch((error: HttpErrorResponse) => {
                this.errorService.handleError(error);
                return Observable.throw(error);
            });

        // return this.http.post(backendURL + 'message' + token, body, {headers: headers})
        //     .map((response: Response) => {
        //         const result = response.json();
        //         const message = new Message(
        //             result.obj.content,
        //             result.obj.user.firstName,
        //             result.obj._id,
        //             result.obj.user._id);
        //         this.messages.push(message);
        //         return message;
        //     })
        //     .catch((error: Response) => {
        //         this.errorService.handleError(error.json());
        //         return Observable.throw(error.json());
        //     });
    }

    getMessages() {
        return this.http.get(backendURL + 'message')
            .map((response: Response) => {
                const messages = response.json().obj;
                let transformedMessages: Message[] = [];
                for (let message of messages) {
                    transformedMessages.push(new Message(
                        message.content,
                        message.user.firstName,
                        message._id,
                        message.user._id)
                    );
                }
                this.messages = transformedMessages;
                return transformedMessages;
            })
            .catch((error: Response) => {
                this.errorService.handleError(error.json());
                return Observable.throw(error.json());
            });
    }

    editMessage(message: Message) {
        this.messageIsEdit.emit(message);
    }

    updateMessage(message: Message) {
        const body = JSON.stringify(message);
        const headers = new Headers({'Content-Type': 'application/json'});
        const token = localStorage.getItem('token')
            ? '?token=' + localStorage.getItem('token')
            : '';
        return this.http.patch(backendURL + 'message/' + message.messageId + token, body, {headers: headers})
            .map((response: Response) => response.json())
            .catch((error: Response) => {
                this.errorService.handleError(error.json());
                return Observable.throw(error.json());
            });
    }

    deleteMessage(message: Message) {
        this.messages.splice(this.messages.indexOf(message), 1);
        const token = localStorage.getItem('token')
            ? '?token=' + localStorage.getItem('token')
            : '';
        return this.http.delete(backendURL + 'message/' + message.messageId + token)
            .map((response: Response) => response.json())
            .catch((error: Response) => {
                this.errorService.handleError(error.json());
                return Observable.throw(error.json());
            });
    }
}
