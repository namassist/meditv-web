import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/features/auth/firebase-client";

const isDev = process.env.NODE_ENV === "development";

function debugLog(label: string, data: unknown) {
  if (!isDev) return;
  console.debug(`[MediTV] ${label}`, data);
}

function debugChange(
  label: string,
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
) {
  if (!isDev) return;
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  for (const key of allKeys) {
    if (JSON.stringify(prev[key]) !== JSON.stringify(next[key])) {
      changes[key] = { from: prev[key], to: next[key] };
    }
  }
  if (Object.keys(changes).length > 0) {
    console.debug(`[MediTV] ${label} changed:`, changes);
  }
}

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
  debugLog("watchMeditvScreen started", {
    clinicId: session.clinicId,
    doctorIds: session.doctorIds,
    screenDocumentPath: session.screenDocumentPath,
  });

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
    let isFirst = true;
    unsubs.push(
      onSnapshot(
        doc(firestore, session.screenDocumentPath),
        (snapshot) => {
          const newData = snapshot.data() ?? {};
          if (isFirst) {
            debugLog(`screenDoc initial (${session.screenDocumentPath})`, newData);
            isFirst = false;
          } else {
            debugChange(`screenDoc (${session.screenDocumentPath})`, screenDoc, newData as Record<string, unknown>);
          }
          Object.assign(screenDoc, newData);
          emit();
        },
        (error) => {
          debugLog("screenDoc error", error.message);
          onError(error as Error);
        },
      ),
    );
  }

  for (const doctorId of session.doctorIds) {
    const queueDocId = `${session.clinicId}_${doctorId}`;

    let isFirstQueue = true;
    unsubs.push(
      onSnapshot(
        doc(firestore, "doctorQueues", queueDocId),
        (snapshot) => {
          const newData =
            (snapshot.data() as Record<string, unknown>) ?? {};
          if (isFirstQueue) {
            debugLog(`doctorQueue initial (${queueDocId})`, newData);
            isFirstQueue = false;
          } else {
            debugChange(`doctorQueue (${queueDocId})`, queueDocs[doctorId] ?? {}, newData);
          }
          queueDocs[doctorId] = newData;
          emit();
        },
        (error) => {
          debugLog(`doctorQueue error (${queueDocId})`, error.message);
          onError(error as Error);
        },
      ),
    );

    let isFirstPayment = true;
    unsubs.push(
      onSnapshot(
        doc(firestore, "paymentQueues", queueDocId),
        (snapshot) => {
          const newData =
            (snapshot.data() as Record<string, unknown>) ?? {};
          if (isFirstPayment) {
            debugLog(`paymentQueue initial (${queueDocId})`, newData);
            isFirstPayment = false;
          } else {
            debugChange(`paymentQueue (${queueDocId})`, paymentDocs[doctorId] ?? {}, newData);
          }
          paymentDocs[doctorId] = newData;
          emit();
        },
        (error) => {
          debugLog(`paymentQueue error (${queueDocId})`, error.message);
          onError(error as Error);
        },
      ),
    );
  }

  return () => {
    debugLog("watchMeditvScreen unsubscribed", {
      clinicId: session.clinicId,
      doctorIds: session.doctorIds,
    });
    for (const unsubscribe of unsubs) unsubscribe();
  };
}
