import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';

// ═══════════════════════════════════════════════════════════
//  BUILDER PROFILE HOOK
// ═══════════════════════════════════════════════════════════

export const useBuilderProfile = (user) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('builders')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      setProfile(data || null);
    } catch (err) {
      console.error('Error fetching builder profile:', err);
      setError(err.message || 'Failed to load profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(
    async (profileData) => {
      if (!user) {
        setError('User not authenticated');
        return null;
      }

      try {
        setError(null);
        const dataToSave = {
          user_id: user.id,
          company_name: profileData.company_name || null,
          abn: profileData.abn || null,
          contact_name: profileData.contact_name || null,
          contact_email: profileData.contact_email || null,
          contact_phone: profileData.contact_phone || null,
          mobile: profileData.mobile || null,
          service_type: profileData.service_type || 'Supply & Install',
          region: profileData.region || null,
          street_address: profileData.street_address || null,
          suburb: profileData.suburb || null,
          state: profileData.state || 'QLD',
          postcode: profileData.postcode || null,
          default_markup: profileData.default_markup ?? 0,
          notes: profileData.notes || null,
          updated_at: new Date().toISOString(),
        };

        let result;
        if (profile && profile.id) {
          const { data, error: updateError } = await supabase
            .from('builders')
            .update(dataToSave)
            .eq('id', profile.id)
            .select()
            .single();
          if (updateError) throw updateError;
          result = data;
        } else {
          const { data, error: insertError } = await supabase
            .from('builders')
            .insert([dataToSave])
            .select()
            .single();
          if (insertError) throw insertError;
          result = data;
        }

        setProfile(result);
        return result;
      } catch (err) {
        console.error('Error saving builder profile:', err);
        const errorMsg = err.message || 'Failed to save profile';
        setError(errorMsg);
        throw err;
      }
    },
    [user, profile]
  );

  const refreshProfile = useCallback(() => {
    return fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    saveProfile,
    refreshProfile,
  };
};


// ═══════════════════════════════════════════════════════════
//  SITE CONTACTS HOOK
// ═══════════════════════════════════════════════════════════

export const useSiteContacts = (user, builderProfile) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContacts = useCallback(async () => {
    if (!user || !builderProfile?.id) {
      setContacts([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('site_contacts')
        .select('*')
        .eq('builder_id', builderProfile.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setContacts(data || []);
    } catch (err) {
      console.error('Error fetching site contacts:', err);
      setError(err.message || 'Failed to load site contacts');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [user, builderProfile?.id]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = useCallback(async (contact) => {
    if (!builderProfile?.id) {
      setError('No builder profile found');
      return null;
    }

    // Check for duplicate (same name + phone)
    const exists = contacts.find(
      c => c.name.toLowerCase() === contact.name.toLowerCase() && c.phone === contact.phone
    );
    if (exists) return exists;

    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('site_contacts')
        .insert([{
          builder_id: builderProfile.id,
          name: contact.name,
          phone: contact.phone,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      setContacts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding site contact:', err);
      setError(err.message || 'Failed to save contact');
      return null;
    }
  }, [builderProfile?.id, contacts]);

  const removeContact = useCallback(async (contactId) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('site_contacts')
        .delete()
        .eq('id', contactId);

      if (deleteError) throw deleteError;
      setContacts(prev => prev.filter(c => c.id !== contactId));
      return true;
    } catch (err) {
      console.error('Error removing site contact:', err);
      setError(err.message || 'Failed to remove contact');
      return false;
    }
  }, []);

  const refreshContacts = useCallback(() => {
    return fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    addContact,
    removeContact,
    refreshContacts,
  };
};


// ═══════════════════════════════════════════════════════════
//  BUILDER ORDERS HOOK (placeholder for future use)
// ═══════════════════════════════════════════════════════════

export const useBuilderOrders = (user) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setOrders([]);
    } catch (err) {
      console.error('Error fetching builder orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refreshOrders: fetchOrders,
  };
};
