import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Params } from './params';

describe('Params', () => {
  let component: Params;
  let fixture: ComponentFixture<Params>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Params]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Params);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
