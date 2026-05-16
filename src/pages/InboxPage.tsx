import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

type Contact = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'contacted' | 'discarded';
  created_at: string;
};

export default function InboxPage() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchContacts() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error.message);
    } else {
      setContacts(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchContacts();

    const channel = supabase
      .channel('contacts-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          const newContact = payload.new as Contact;

          setContacts((currentContacts) => {
            const alreadyExists = currentContacts.some(
              (contact) => contact.id === newContact.id,
            );

            if (alreadyExists) {
              return currentContacts;
            }

            return [newContact, ...currentContacts];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(
    contactId: string,
    newStatus: 'new' | 'contacted' | 'discarded',
  ) {
    const { error } = await supabase
      .from('contacts')
      .update({ status: newStatus })
      .eq('id', contactId);

    if (error) {
      console.error('Error updating status:', error.message);
      return;
    }

    setContacts((currentContacts) =>
      currentContacts.map((contact) =>
        contact.id === contactId ? { ...contact, status: newStatus } : contact,
      ),
    );
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading contacts...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Agency Inbox</h1>

        <button
          onClick={handleLogout}
          className="bg-black hover:bg-gray-800 transition text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          No contacts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white p-6 rounded-2xl shadow-md border border-gray-100"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{contact.name}</h2>
                  <p className="text-gray-600">{contact.email}</p>
                </div>

                <select
                  value={contact.status}
                  onChange={(e) =>
                    updateStatus(
                      contact.id,
                      e.target.value as 'new' | 'contacted' | 'discarded',
                    )
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="discarded">Discarded</option>
                </select>
              </div>

              <p className="mt-4">{contact.message}</p>

              <p className="mt-4 text-sm text-gray-500">
                Created: {new Date(contact.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
