import { TestBed } from '@angular/core/testing';

import { Calendar } from './data.service';

describe('Calendar', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Calendar = TestBed.get(Calendar);
    expect(service).toBeTruthy();
  });
});
