import { useEffect, useState } from 'react';
import PetBasicInfoForm from '../components/PetBasicInfoForm.jsx';
import ProfileDataCard from '../components/ProfileDataCard.jsx';
import PetHealthForm from '../components/PetHealthForm.jsx';
import ProfilePetList from '../components/ProfilePetList.jsx';
import ProfileUserCard from '../components/ProfileUserCard.jsx';
import { emptyPetForm, usePets } from '../hooks/usePets.js';
import { useAuth } from '../hooks/useAuth.js';
import { useProfileHealthStats } from '../hooks/useProfileHealthStats.js';
import { useUserProfile } from '../hooks/useUserProfile.js';

const inputClass =
  'w-full rounded-control border border-paw-border bg-paw-background px-3 py-2.5 text-xs text-paw-primary outline-none transition focus:border-paw-healthy';

function Profile() {
  const { user } = useAuth();
  const { activePetId, error, formFromPet, loading, pet, pets, savePet, saving, selectPet } = usePets();
  const {
    error: profileError,
    loading: profileLoading,
    profile,
    saveRelationName,
    saveUsername,
    saving: usernameSaving,
  } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyPetForm);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [profileEditing, setProfileEditing] = useState(false);
  const [relationDraft, setRelationDraft] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');
  const profileStats = useProfileHealthStats(activePetId);

  useEffect(() => {
    setUsernameDraft(profile?.username || '');
    setRelationDraft(profile?.pet_relation_name || '主人');
  }, [profile]);

  const setValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const editPet = (pet) => {
    setNotice('');
    setFormError('');
    selectPet(pet.id);
    setForm(formFromPet(pet));
    setEditing(true);
  };

  const addPet = () => {
    setNotice('');
    setFormError('');
    setForm(emptyPetForm);
    setEditing(true);
  };

  const handleSavePet = async (event) => {
    event.preventDefault();
    setNotice('');
    setFormError('');
    try {
      await savePet(form);
      setNotice('宠物档案已保存');
      setEditing(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleSaveProfileSettings = async () => {
    setNotice('');
    setFormError('');
    try {
      await saveUsername(usernameDraft);
      await saveRelationName(relationDraft);
      setNotice('个人资料已保存');
      setProfileEditing(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading || profileLoading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">我的</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">正在读取资料</h1>
      </section>
    );
  }

  if (editing) {
    return (
      <form className="space-y-2.5" onSubmit={handleSavePet}>
        <section className="sticky top-0 z-10 -mx-4 border-b border-paw-border bg-paw-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-paw-muted">宠物档案</p>
              <h1 className="font-title text-xl font-semibold">{form.id ? '编辑宠物' : '添加宠物'}</h1>
            </div>
            <button className="rounded-control border border-paw-border bg-paw-card px-3 py-2 text-xs font-semibold text-paw-muted" onClick={() => setEditing(false)} type="button">
              返回
            </button>
          </div>
        </section>

        {(formError || error) && <section className="rounded-control border border-paw-danger bg-paw-danger/10 px-4 py-3 text-sm text-paw-danger">{formError || error}</section>}

        <PetBasicInfoForm form={form} inputClass={inputClass} setValue={setValue} />
        <PetHealthForm form={form} inputClass={inputClass} setValue={setValue} />
        <section className="sticky bottom-24 -mx-4 border-t border-paw-border bg-paw-background/95 px-4 py-3 backdrop-blur">
          <button
            className="w-full rounded-card bg-paw-primary px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? '保存中...' : '保存宠物档案'}
          </button>
        </section>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <ProfileUserCard
        inputClass={inputClass}
        onSave={handleSaveProfileSettings}
        profile={profile}
        profileEditing={profileEditing}
        relationDraft={relationDraft}
        setProfileEditing={setProfileEditing}
        setRelationDraft={setRelationDraft}
        setUsernameDraft={setUsernameDraft}
        user={user}
        usernameDraft={usernameDraft}
        usernameSaving={usernameSaving}
      />

      {(notice || formError || error || profileError) && (
        <section
          className={`rounded-control border px-4 py-3 text-sm ${
            notice
              ? 'border-paw-healthy bg-paw-healthy/10 text-paw-healthy'
              : 'border-paw-danger bg-paw-danger/10 text-paw-danger'
          }`}
        >
          {notice || formError || error || profileError}
        </section>
      )}

      <ProfileDataCard
        healthScore={profileStats.healthScore}
        loading={profileStats.loading}
        monthRecordDays={profileStats.monthRecordDays}
        petName={pet?.name}
        streakDays={profileStats.streakDays}
      />

      <ProfilePetList onAdd={addPet} onEdit={editPet} pets={pets} />
    </div>
  );
}

export default Profile;
