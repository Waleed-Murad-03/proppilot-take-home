import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function ContactPage() {
  const { agencySlug } = useParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatusMessage('Submitting...');

    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('slug', agencySlug)
      .single();

    if (agencyError || !agency) {
      setStatusMessage('Agency not found.');
      return;
    }

    const { error: contactError } = await supabase.from('contacts').insert({
      agency_id: agency.id,
      name,
      email,
      message,
    });

    if (contactError) {
      setStatusMessage('Something went wrong. Please try again.');
      return;
    }

    setName('');
    setEmail('');
    setMessage('');
    setStatusMessage('Message submitted successfully.');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-2">Contact Agency</h1>

        <p className="text-gray-600 mb-6">Send your inquiry to {agencySlug}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button
            className="w-full bg-black hover:bg-gray-800 transition text-white rounded-lg py-2 font-medium"
            type="submit"
          >
            Submit
          </button>
        </form>

        {statusMessage && (
          <p className="mt-4 text-sm text-gray-700">{statusMessage}</p>
        )}
      </div>
    </div>
  );
}

export default ContactPage;
