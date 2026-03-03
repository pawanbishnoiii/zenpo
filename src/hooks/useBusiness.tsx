import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useBusiness = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const businessQuery = useQuery({
    queryKey: ['business', user?.id],
    enabled: !authLoading && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user!.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 20_000,
  });

  const createBusiness = useCallback(
    async (name: string, category: string) => {
      if (!user) return { data: null, error: new Error('User not found') };

      const { data, error } = await supabase
        .from('businesses')
        .insert({
          owner_id: user.id,
          business_name: name,
          category,
          theme: category === 'car_wash' ? 'car_wash' : 'spare_parts',
        })
        .select()
        .single();

      if (error || !data) return { data: null, error };

      await supabase.rpc('seed_business_starter_catalog', { _business_id: data.id });
      await queryClient.invalidateQueries({ queryKey: ['business', user.id] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      return { data, error: null };
    },
    [queryClient, user]
  );

  const loading = authLoading || (!!user && businessQuery.isLoading);

  return {
    business: businessQuery.data ?? null,
    loading,
    createBusiness,
    refetch: businessQuery.refetch,
  };
};
