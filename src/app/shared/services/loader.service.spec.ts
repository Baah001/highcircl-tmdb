import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
  });

  it('starts loading with empty message', () => {
    expect(service.isLoading()).toBe(true);
    expect(service.message()).toBe('');
  });

  it('show sets loading true and message', () => {
    service.show('Fetching...');
    expect(service.isLoading()).toBe(true);
    expect(service.message()).toBe('Fetching...');
  });

  it('show uses default message when omitted', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
    expect(service.message()).toBe('Loading...');
  });

  it('hide sets loading false and clears message', () => {
    service.show('X');
    service.hide();
    expect(service.isLoading()).toBe(false);
    expect(service.message()).toBe('');
  });

  it('show after hide sets loading true again', () => {
    service.hide();
    service.show('Back');
    expect(service.isLoading()).toBe(true);
    expect(service.message()).toBe('Back');
  });
});
