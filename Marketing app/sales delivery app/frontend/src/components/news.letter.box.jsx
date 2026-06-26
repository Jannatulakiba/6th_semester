import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

const NewsletterBox = () => {
  const [email, setEmail] = useState('');

  const onSubmitHandler = useCallback(
    (event) => {
      event.preventDefault();
      toast.success('Subscribed successfully!');
      setEmail('');
    },
    []
  );

  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe now &amp; get 20% off</p>
      <p className='text-gray-400 mt-3'>
        Stay updated with our latest collections, exclusive deals, and fashion tips delivered straight to your inbox.
      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input
          className='w-full sm:flex-1 outline-none'
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4 hover:bg-gray-800 transition-colors'>
          SUBSCRIBE
        </button>
      </form>
    </div>
  );
};

export default NewsletterBox;