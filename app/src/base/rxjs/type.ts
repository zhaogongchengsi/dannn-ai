import type { AnswerMessage, QuestionMessage } from '@dannn/schemas'
import type { Subject, Subscription } from 'rxjs'
import type { ReplaySubject } from 'rxjs/internal/ReplaySubject'
import type { ExtensionWorker } from '../worker/worker'

export interface AppRx {
  appMount$: ReplaySubject<boolean>
  appReady$: ReplaySubject<boolean>
  extensionWorkerSubject: Subject<ExtensionWorker>
  getExtensionWorker: (id: string) => ExtensionWorker | undefined
  getExtensionWorkers: () => ExtensionWorker[]
  appMount: () => void
  onAppReady: (func: () => void) => Subscription
  extensionDestroy: () => void
  onExtensionLoaded: (callback: (worker: ExtensionWorker) => void) => Subscription
  subscribeToWorkerAnswers: (callback: (message: AnswerMessage) => void) => () => void
  sendQuestionToWorker: (message: QuestionMessage) => void
}
