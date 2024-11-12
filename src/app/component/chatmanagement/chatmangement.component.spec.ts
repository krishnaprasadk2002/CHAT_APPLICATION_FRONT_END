import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatmangementComponent } from './chatmangement.component';

describe('ChatmangementComponent', () => {
  let component: ChatmangementComponent;
  let fixture: ComponentFixture<ChatmangementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatmangementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatmangementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
