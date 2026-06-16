import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, filter } from 'rxjs';

export type ExplanationReadyEvent = {
  attemptId: string;
  questionId: string;
  explanation: {
    correctAnswer: string;
    steps: unknown;
    wrongAlternativeNotes: unknown;
  };
  probableError: string | null;
};

@Injectable()
export class ExplanationEventsService {
  private readonly events = new Subject<MessageEvent>();
  private readonly latest = new Map<string, MessageEvent>();

  stream(attemptId: string): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const cached = this.latest.get(attemptId);
      if (cached) {
        subscriber.next(cached);
        subscriber.complete();
        return undefined;
      }

      const subscription = this.events
        .asObservable()
        .pipe(filter((event) => (event.data as ExplanationReadyEvent | undefined)?.attemptId === attemptId))
        .subscribe({
          next: (event) => {
            subscriber.next(event);
            subscriber.complete();
          },
          error: (error) => subscriber.error(error),
        });

      return () => subscription.unsubscribe();
    });
  }

  emitReady(data: ExplanationReadyEvent) {
    const event = { type: 'explanation.ready', data };
    this.latest.set(data.attemptId, event);
    const timeout = setTimeout(() => this.latest.delete(data.attemptId), 5 * 60 * 1000);
    timeout.unref?.();
    this.events.next(event);
  }
}
