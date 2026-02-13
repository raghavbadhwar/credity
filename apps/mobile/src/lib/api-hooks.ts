import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRoleProfile,
  getHolderWalletStatus,
  getHolderReputationScore,
  getHolderSafeDateScore,
  getHolderCredentials,
  getHolderConsents,
  getHolderDataRequests,
  getHolderCertInIncidents,
} from './api-client';

export function useHolderDashboardData(enabled: boolean) {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['holder', 'profile'],
    queryFn: () => getRoleProfile('holder'),
    enabled,
  });

  const walletQuery = useQuery({
    queryKey: ['holder', 'wallet'],
    queryFn: getHolderWalletStatus,
    enabled,
  });

  const reputationQuery = useQuery({
    queryKey: ['holder', 'reputation'],
    queryFn: getHolderReputationScore,
    enabled,
  });

  const safeDateQuery = useQuery({
    queryKey: ['holder', 'safedate'],
    queryFn: getHolderSafeDateScore,
    enabled,
  });

  const credentialsQuery = useQuery({
    queryKey: ['holder', 'credentials'],
    queryFn: getHolderCredentials,
    enabled,
  });

  const consentsQuery = useQuery({
    queryKey: ['holder', 'consents'],
    queryFn: () => getHolderConsents(1),
    enabled,
  });

  const requestsQuery = useQuery({
    queryKey: ['holder', 'requests'],
    queryFn: () => getHolderDataRequests(1),
    enabled,
  });

  const incidentsQuery = useQuery({
    queryKey: ['holder', 'incidents'],
    queryFn: getHolderCertInIncidents,
    enabled,
  });

  const isLoading =
    profileQuery.isLoading ||
    walletQuery.isLoading ||
    reputationQuery.isLoading ||
    safeDateQuery.isLoading ||
    credentialsQuery.isLoading ||
    consentsQuery.isLoading ||
    requestsQuery.isLoading ||
    incidentsQuery.isLoading;

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['holder'] });
  };

  return {
    profile: profileQuery.data || null,
    wallet: walletQuery.data || null,
    reputation: reputationQuery.data || null,
    safeDate: safeDateQuery.data || null,
    credentials: credentialsQuery.data || [],
    consents: consentsQuery.data || [],
    dataRequests: requestsQuery.data || [],
    certInIncidents: incidentsQuery.data || [],
    isLoading,
    refresh,
  };
}
