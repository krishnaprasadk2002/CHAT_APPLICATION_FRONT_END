import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { User, userResponse } from '../../core/model/IUser';
import { IMessage } from '../../core/model/IMessages';
import { debounceTime, of, Subject, Subscription, switchMap } from 'rxjs';
import { SocketIoService } from '../../core/services/socket-io.service';
import { ChatService } from '../../core/services/chat.service';
import { Router } from '@angular/router';
import { ICreateNewChatSuccessfullAPIResponse } from '../../core/model/IChatResponse';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { ImageZoomDirective } from '../../core/directives/image-zoom.directive';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-chatmanagement',
  standalone: true,
  imports: [FormsModule, CommonModule, UserModalComponent,PickerComponent,ImageZoomDirective],
  templateUrl: './chatmangement.component.html',
  styleUrl: './chatmangement.component.css'
})
export class ChatmanagementComponent {
  isConnected: boolean = false;
  Message!: string;
  Users: User[] = [];
  receiverData: User[] = [];
  selectedUserId: string | undefined;
  currentUserId: string | undefined;
  currentChatId!: string;
  messages: IMessage[] = []; 
  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();
  chatHistory: IMessage[] = [];
  newGroupChatModal: boolean = false;
  isCreateGroupModalOpen: boolean = false;
  newGroupForm!: FormGroup;
  groupMembers: string[] = [];
  availableUsers: User[] = [];
  groupName!:string
  groupChats:any[]=[]
  isGroupChat: boolean = false;
  userData: User[] = []; 
  isModalOpen: boolean = false;
  selectedAttachmentType: 'text' | 'image' | 'video' | 'document' | 'audio' | null = null;
  attachmentFile: File | null = null;
  showEmojiPicker: boolean = false;
  searchTerm: string = '';
  searchResults: any[] = [];
 


  

  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('createGroupModal') createGroupModal!: TemplateRef<any>;
  @ViewChild('emojiPicker') emojiPicker!: PickerComponent;

 // Observable to track selected user changes
 private selectedUserSubject = new Subject<string>();

 constructor(
   private socketService: SocketIoService,
   private chatService: ChatService,
   private ngZone: NgZone ,
   private router: Router,
 ) { 
   this.newGroupForm = new FormGroup({
     groupName: new FormControl("", [Validators.required])
   });
 }

 ngOnInit() {
  this.subscriptions.add(
    this.socketService.connected$.subscribe(connected => {
      this.isConnected = connected;
    })
  );

  // Subscribe to selected user changes
  this.subscriptions.add(
    this.selectedUserSubject.asObservable().subscribe((userId: string) => {
      this.onUserChange(userId);
    })
  );

  this.getAllUsers();
  this.getUserId();
  this.ReceivingMessage();
  this.getUsersDetailsUsingGroup()
  this.getUserGroupChats()
  this.getUserData()

  // Listen for chat history
  this.subscriptions.add(
    this.chatService.onChatHistoryFetched().subscribe(messages => {
      console.log('Chat history fetched:', messages);
      this.chatHistory.push(...messages);
    })
  );
}
ngAfterViewInit(): void {
  this.scrollToBottom()
}

private scrollToBottom(): void {
  if (this.chatContainer?.nativeElement) {
    this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
  }
}

ngOnDestroy() {
  this.subscriptions.unsubscribe();
}


  // Call this method when a user is clicked
  onUserChange(userId: string) {
    this.selectedUserId = userId;
    this.messages = [];
    this.chatHistory = [];
    this.isGroupChat = false; 
    this.createChat(userId);
  

    // Fetch receiver profile
    this.chatService.getReceiverDataProfile(userId).subscribe({
      next: (res: userResponse) => {
        this.receiverData = Array.isArray(res.data) ? res.data : [res.data];
      },
      error: this.handleError
    });
  }

  createChat(receiverId: string): void {
    this.chatService.createNewChat(receiverId).subscribe({
      next: (response: ICreateNewChatSuccessfullAPIResponse) => {
        const chatId = response.data['_doc'].chatId;
        this.currentChatId = chatId;

        // Fetch chat history after creating the chat
        this.chatService.fetchChatHistory(chatId);
        this.joinChat(chatId);
      },
      error: this.handleError
    });
  }

  sendMessage(): void {
    if (!this.Message || !this.currentChatId) {
      console.warn('Message or chat ID is missing.');
      return;
    }
  
    const messageData: IMessage = {
      chatId: this.currentChatId,
      senderId: this.currentUserId || '',
      receiverId: this.isGroupChat ? '' : this.selectedUserId || '',
      message: this.Message,
      type: 'text',
      isRead: false,
      createdAt: new Date(),
    };
  
    if (this.isGroupChat) {
      // Emit group message
      this.socketService.emit('sendGroupMessage', messageData);
    } else {
      // Emit one-to-one message
      this.socketService.emit('sendMessage', messageData);
    }
  
    this.Message = ''; 
    this.scrollToBottom(); 
  }
  

  ReceivingMessage() {
    // Listening for one-to-one messages
    this.socketService.on<IMessage>('receiveMessage').subscribe(message => {
      if (message.chatId === this.currentChatId && !this.isGroupChat) {
        this.handleReceivedMessage(message);
      }
    });
  
    // Listening for group messages
    this.socketService.on<IMessage>('receiveGroupMessage').subscribe(message => {
      if (message.chatId === this.currentChatId && this.isGroupChat) {
        this.handleReceivedMessage(message);
      }
    });
  }
  
  private handleReceivedMessage(message: IMessage) {
    if (message.type && message.type !== 'text' && message.file?.url) {
      message.message = message.file.url; 
    }
    this.chatHistory.push(message);
    console.log(this.chatHistory);
    
    this.scrollToBottom();
  }
  
  
  
  // Decode base64 file for display
  private decodeBase64File(base64Data: string, type: string): string {
    const base64PrefixMap: { [key: string]: string } = {
      image: 'data:image/jpeg;base64,',
      video: 'data:video/mp4;base64,',
      audio: 'data:audio/mpeg;base64,'
    };
    const prefix = base64PrefixMap[type] || '';
    return `${prefix}${base64Data}`;
  }
  
  


  getAllUsers() {
    this.loading = true;
    this.chatService.GetAllUsers().subscribe(
      (response: userResponse) => {
        this.Users = response.data.filter(user => user._id !== undefined);
        this.loading = false;
      },
      (error) => {
        this.handleError(error);
        this.loading = false;
      }
    );
  }

  getUserId() {
    this.chatService.getUserId().subscribe({
      next: (res) => {
        if (res.success) {
          this.currentUserId = res.userId;
        } else {
          console.error('Failed to fetch user ID:', res.message);
        }
      },
      error: this.handleError
    });
  }

  private handleError(error: any): void {
    console.error('An error occurred:', error);
  }

  getUserNameById(userId: string): string {
    const user = this.Users.find(u => u._id === userId);
    return user ? user.name : 'Unknown User';
  }

  getUserColor(userId: string): string {
    return userId === this.currentUserId ? 'green' : 'blue';
  }

  joinChat(chatId: string) {
    this.socketService.emit('join-chat', chatId)
  }

  trackByMessageId(index: number, message: IMessage): string {
    return message._id!;
  }


  //Group chat starting
  openOrCloseNewChatOrGroupChatModal() {
    this.ngZone.run(() => {
      this.isCreateGroupModalOpen = !this.isCreateGroupModalOpen;
      console.log(this.isCreateGroupModalOpen);
    });
  }

  addToGroupMember(userId: string) {
    const index = this.groupMembers.indexOf(userId);
    if (index === -1) {
      this.groupMembers.push(userId);
    } else {
      this.groupMembers.splice(index, 1);
    }
    console.log('Current group members:', this.groupMembers);
  }

  isInNewGroup(userId: string): boolean {
    return this.groupMembers.includes(userId);
  }

  createNewGroup() {

    this.groupMembers = this.availableUsers
        .filter(user => user.selected)
        .map(user => user._id)
        .filter((id): id is string => id !== undefined);
    
    console.log('Group Members:', this.groupMembers);

    if (this.groupMembers.length > 0 && this.groupName) { 
        this.chatService.createGroupChat(this.groupName, this.groupMembers).subscribe({
            next: (response) => {
                console.log('Group created:', response);
                this.resetGroupCreation();
            },
            error: (error) => {
                console.error('Error creating group:', error);
            }
        });
    } else {
        console.warn('No users selected for the group or group name is empty.');
    }
}

  
  
  

  private resetGroupCreation() {
    this.newGroupForm.reset();
    this.groupMembers = [];
    this.isCreateGroupModalOpen = false;
    this.newGroupChatModal = false;
    this.availableUsers = [];
    this.getAllUsers();
  }

  searchToStartOrCreateNewGroupChatOrChat(event: KeyboardEvent) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.availableUsers = this.Users.filter(user => 
      user.name.toLowerCase().includes(searchTerm)
    );
  }

  getUsersDetailsUsingGroup() {
    this.chatService.GetAllUsers().subscribe({
      next: (res: userResponse) => {
        console.log(res.data);
        
        this.availableUsers = res.data;
      },
      error: (err) => {
        console.error('Error fetching users', err);
      }
    });
  }

  userSelectingInGroup(user: User){
    if (user.selected) {
      console.log(`User selected: ${user.name}`);
    } else {
      console.log(`User deselected: ${user.name}`);
    }
  }

  getUserGroupChats() {
    this.chatService.getUserGroupChats().subscribe({
      next: (res: userResponse) => {
        this.groupChats = res.data; 
        console.log(this.groupChats);
        
      },
      error: this.handleError
    });
  }
  selectGroupChat(chatId: string) {
    this.currentChatId = chatId;
    this.groupSocketJoin(chatId)
    this.messages = [];
    this.chatHistory = [];
    this.isGroupChat = true; 
    
    this.chatService.fetchChatHistory(chatId);
    this.joinChat(chatId);
  }


  groupSocketJoin(chatId:string){
    console.log('join group chat Id',chatId);
    this.socketService.emit('joinGroupChat',chatId)
  }

  getUserData() {
    this.chatService.getUserData().subscribe(
      (response:any) => {

        if (response.data && typeof response.data === 'object') {
          console.log(response.data,'user data');
          
          this.userData = [response.data]; 
        } else {
          this.userData = [];
          console.error('Unexpected user data format:', response);
        }
      },
      (error) => {
        this.handleError(error);
        this.userData = [];
      }
    );
  }
  
  goToUserProfile(userId: string | undefined) {
    if (userId) {
      this.router.navigate(['/user-profile', userId]); 
    }
  }

  openModal() {
    this.isModalOpen = !this.isModalOpen; 
  }



  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.Message = this.Message ? this.Message + event.emoji.native : event.emoji.native;
    this.showEmojiPicker = false; 
  }
  

  toggleAttachmentModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  selectAttachmentType(type: 'image' | 'video' | 'audio' | 'document') {
    this.selectedAttachmentType = type;
    this.isModalOpen = false;
    document.getElementById('fileInput')?.click(); 
  }
  

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.attachmentFile = file;
      this.sendFileMessage();
    }
  }

  sendFileMessage() {
    if (!this.selectedAttachmentType && !this.attachmentFile) return;
  
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
  
      const messageData: IMessage = {
        chatId: this.currentChatId,
        senderId: this.currentUserId || '',
        receiverId: this.isGroupChat ? '' : this.selectedUserId || '',
        message: base64Data,
        type: this.selectedAttachmentType || 'text', 
        isRead: false,
        createdAt: new Date(),
      };
  
      if (this.isGroupChat) {

        this.socketService.emit('sendGroupMessage', messageData);
      } else {

        this.socketService.emit('sendMessage', messageData);
      }
  
      this.attachmentFile = null;
      this.selectedAttachmentType = null;
    };
  
    if (this.attachmentFile) {
      reader.readAsDataURL(this.attachmentFile); 
    }
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value; 
    this.debounceSearch(searchTerm);
  }

  debounceSearch(searchTerm: string): void {
    of(searchTerm).pipe(
      debounceTime(300), 
      switchMap((term) => this.chatService.onSearch(term)) 
    ).subscribe((results) => {
      this.searchResults = results;
    });
  }
    
  }
