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
      <form className="space-y-3" onSubmit={handleSavePet}>
        <section className="sticky top-0 z-10 -mx-4 border-b border-paw-border bg-paw-background/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-paw-muted">宠物档案</p>
              <h1 className="font-title text-2xl font-semibold">{form.id ? '编辑宠物' : '添加宠物'}</h1>
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
            className="w-full rounded-card bg-paw-primary px-4 py-4 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
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
      <section className="rounded-card border border-paw-border bg-paw-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-paw-muted">我的</p>
            <h1 className="mt-1 truncate font-title text-2xl font-semibold">
              {profile?.username || 'PawCare 用户'}
            </h1>
            <p className="mt-1 truncate text-xs text-paw-muted">{user?.email || '未登录邮箱'}</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-control border border-paw-border bg-paw-background px-2.5 py-2 text-xs" type="button">
              消息
            </button>
            <button
              className="rounded-control border border-paw-border bg-paw-background px-2.5 py-2 text-xs text-paw-muted"
              type="button"
            >
              设置
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-control bg-paw-background px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 text-xs leading-5 text-paw-muted">
              <p className="truncate">昵称：{profile?.username || '未设置'}</p>
              <p className="truncate">称呼：{profile?.pet_relation_name || '主人'}</p>
            </div>
            <button
              className="shrink-0 rounded-control border border-paw-border bg-paw-card px-3 py-2 text-xs font-semibold text-paw-secondary"
              onClick={() => setProfileEditing((current) => !current)}
              type="button"
            >
              {profileEditing ? '收起' : '编辑资料'}
            </button>
          </div>
        </div>
        {profileEditing && (
          <div className="mt-3 space-y-2">
            <label className="block text-xs font-semibold text-paw-secondary">
              昵称
              <input className={`${inputClass} mt-1 py-2.5`} onChange={(event) => setUsernameDraft(event.target.value)} placeholder="设置昵称" value={usernameDraft} />
            </label>
            <label className="block text-xs font-semibold text-paw-secondary">
              宠物对你的称呼
              <input className={`${inputClass} mt-1 py-2.5`} onChange={(event) => setRelationDraft(event.target.value)} placeholder="妈妈、爸爸、姐姐、铲屎官..." value={relationDraft} />
            </label>
            <button
              className="w-full rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background disabled:opacity-50"
              disabled={usernameSaving}
              onClick={handleSaveProfileSettings}
              type="button"
            >
              保存个人资料
            </button>
          </div>
        )}
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
    </div>
  );
}

export default Profile;
