import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useBusiness = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle();
    setBusiness(data);
    setLoading(false);
  };

  const createBusiness = async (name: string, category: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('businesses')
      .insert({ owner_id: user.id, business_name: name, category, theme: category === 'car_wash' ? 'car_wash' : 'spare_parts' })
      .select()
      .single();
    if (!error && data) setBusiness(data);
    return { data, error };
  };

  useEffect(() => { fetchBusiness(); }, [user]);

  return { business, loading, createBusiness, refetch: fetchBusiness };
};
