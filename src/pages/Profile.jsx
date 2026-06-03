import { useEffect, useState } from 'react';
import PetBasicInfoForm from '../components/PetBasicInfoForm.jsx';
import PetHealthForm from '../components/PetHealthForm.jsx';
import PetProfileHeader from '../components/PetProfileHeader.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import { emptyPetForm, usePets } from '../hooks/usePets.js';
import { useAuth } from '../hooks/useAuth.js';

const inputClass =
  'w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm text-paw-primary outline-none transition focus:border-paw-healthy';

function Profile() {
  const { signOut, user } = useAuth();
  const { activePetId, error, loading, petForm, pets, savePet, saving, selectPet } = usePets();
  const [form, setForm] = useState(emptyPetForm);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm(petForm);
  }, [petForm]);

  const setValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCreatePet = () => {
    setNotice('');
    setFormError('');
    setForm(emptyPetForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setNotice('');
    setFormError('');

    try {
      await savePet(form);
      setNotice('宠物档案已保存');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">档案</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">正在读取宠物档案</h1>
      </section>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <PetProfileHeader email={user?.email} form={form} onSignOut={handleSignOut} />
      <PetSwitcher
        activePetId={activePetId}
        label="我的宠物"
        onCreatePet={handleCreatePet}
        onSelectPet={selectPet}
        pets={pets}
      />

      {(notice || formError || error) && (
        <div
          className={`rounded-control border px-4 py-3 text-sm ${
            notice
              ? 'border-paw-healthy bg-[#EEF6F1] text-paw-healthy'
              : 'border-paw-danger bg-[#FDEAEA] text-paw-danger'
          }`}
        >
          {notice || formError || error}
        </div>
      )}

      <PetBasicInfoForm form={form} inputClass={inputClass} setValue={setValue} />
      <PetHealthForm form={form} inputClass={inputClass} setValue={setValue} />

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-card bg-paw-primary px-4 py-4 font-title text-lg font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? '保存中...' : '保存宠物档案'}
      </button>
    </form>
  );
}

export default Profile;
