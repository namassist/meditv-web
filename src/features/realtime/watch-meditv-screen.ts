import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/features/auth/firebase-client";

export function watchMeditvScreen(
  session: {
    clinicId: number;
    doctorIds: number[];
    screenDocumentPath: string | null;
  },
  onData: (payload: {
    screenDoc: Record<string, unknown>;
    queueDocs: Record<number, Record<string, unknown>>;
    paymentDocs: Record<number, Record<string, unknown>>;
  }) => void,
  onError: (error: Error) => void,
) {
  const screenDoc: Record<string, unknown> = {};
  const queueDocs: Record<number, Record<string, unknown>> = {};
  const paymentDocs: Record<number, Record<string, unknown>> = {};
  const unsubs: Array<() => void> = [];

  const emit = () =>
    onData({
      screenDoc: { ...screenDoc },
      queueDocs: { ...queueDocs },
      paymentDocs: { ...paymentDocs },
    });

  if (session.screenDocumentPath) {
    unsubs.push(
      onSnapshot(
        doc(firestore, session.screenDocumentPath),
        (snapshot) => {
          Object.assign(screenDoc, snapshot.data() ?? {});
          emit();
        },
        (error) => onError(error as Error),
      ),
    );
  }

  for (const doctorId of session.doctorIds) {
    unsubs.push(
      onSnapshot(
        doc(firestore, "doctorQueues", `${session.clinicId}_${doctorId}`),
        (snapshot) => {
          queueDocs[doctorId] =
            (snapshot.data() as Record<string, unknown>) ?? {};
          emit();
        },
        (error) => onError(error as Error),
      ),
    );

    unsubs.push(
      onSnapshot(
        doc(firestore, "paymentQueues", `${session.clinicId}_${doctorId}`),
        (snapshot) => {
          paymentDocs[doctorId] =
            (snapshot.data() as Record<string, unknown>) ?? {};
          emit();
        },
        (error) => onError(error as Error),
      ),
    );
  }

  return () => {
    for (const unsubscribe of unsubs) unsubscribe();
  };
}
