import { useEffect, useState } from 'react';
import PetBasicInfoForm from '../components/PetBasicInfoForm.jsx';
import PetHealthForm from '../components/PetHealthForm.jsx';
import ProfilePetList from '../components/ProfilePetList.jsx';
import { emptyPetForm, usePets } from '../hooks/usePets.js';
import { useAuth } from '../hooks/useAuth.js';
import { useUserProfile } from '../hooks/useUserProfile.js';

const inputClass =
  'w-full rounded-control border border-paw-border bg-paw-background px-4 py-3 text-sm text-paw-primary outline-none transition focus:border-paw-healthy';

function Profile() {
  const { user } = useAuth();
  const { error, formFromPet, loading, pets, savePet, saving, selectPet } = usePets();
  const {
    error: profileError,
    loading: profileLoading,
    profile,
    saveUsername,
    saving: usernameSaving,
  } = useUserProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyPetForm);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');

  useEffect(() => {
    setUsernameDraft(profile?.username || '');
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

  const handleSaveUsername = async () => {
    setNotice('');
    setFormError('');
    try {
      await saveUsername(usernameDraft);
      setNotice('昵称已保存');
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

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-paw-muted">我的</p>
            <h1 className="mt-1 truncate font-title text-3xl font-semibold">
              {profile?.username || 'PawCare 用户'}
            </h1>
            <p className="mt-1 truncate text-sm text-paw-muted">{user?.email || '未登录邮箱'}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-control border border-paw-border bg-paw-background px-3 py-2" type="button">
              消息
            </button>
            <button
              className="rounded-control border border-paw-border bg-paw-background px-3 py-2 text-paw-muted"
              type="button"
            >
              设置
            </button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className={inputClass}
            onChange={(event) => setUsernameDraft(event.target.value)}
            placeholder="设置昵称"
            value={usernameDraft}
          />
          <button
            className="shrink-0 rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background disabled:opacity-50"
            disabled={usernameSaving}
            onClick={handleSaveUsername}
            type="button"
          >
            保存
          </button>
        </div>
      </section>

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

      <ProfilePetList onAdd={addPet} onEdit={editPet} pets={pets} />

      {editing && (
        <form className="space-y-4" onSubmit={handleSavePet}>
          <section className="flex items-center justify-between rounded-card border border-paw-border bg-paw-card p-4">
            <div>
              <p className="text-sm font-medium text-paw-muted">宠物档案</p>
              <h2 className="font-title text-2xl font-semibold">{form.id ? '编辑档案' : '添加宠物'}</h2>
            </div>
            <button className="text-sm font-semibold text-paw-muted" onClick={() => setEditing(false)} type="button">
              收起
            </button>
          </section>
          <PetBasicInfoForm form={form} inputClass={inputClass} setValue={setValue} />
          <PetHealthForm form={form} inputClass={inputClass} setValue={setValue} />
          <button
            className="w-full rounded-card bg-paw-primary px-4 py-4 font-title text-lg font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            disabled={saving}
            type="submit"
          >
            {saving ? '保存中...' : '保存宠物档案'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Profile;
