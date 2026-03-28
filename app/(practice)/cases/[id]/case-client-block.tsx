"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CLIENTS_SEED, mergeClients } from "@/lib/clients";
import { effectiveClientId } from "@/lib/matter-client-overrides";
import { useNyayStorage } from "@/lib/use-nyay-storage";
import { routes } from "@/lib/routes";

type Props = {
  matterId: string;
  seedClientId: string;
};

export function CaseClientBlock({ matterId, seedClientId }: Props) {
  const { extraClients, overrides } = useNyayStorage();

  const allClients = useMemo(
    () => mergeClients(extraClients),
    [extraClients],
  );

  const clientId = useMemo(
    () =>
      effectiveClientId({ id: matterId, clientId: seedClientId }, overrides),
    [matterId, seedClientId, overrides],
  );

  const client =
    allClients.find((c) => c.id === clientId) ??
    CLIENTS_SEED.find((c) => c.id === clientId);
  const displayName = client?.name ?? clientId;

  return (
    <>
      <dt className="text-xs font-semibold uppercase tracking-wider text-nyay-authority/90">
        Client
      </dt>
      <dd className="mt-1 text-sm font-medium text-white">
        <Link
          href={routes.client(clientId)}
          className="rounded outline-none transition-colors hover:text-nyay-authority focus-visible:ring-2 focus-visible:ring-nyay-authority/50"
        >
          {displayName}
        </Link>
      </dd>
    </>
  );
}
