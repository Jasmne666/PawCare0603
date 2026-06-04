function ProfileUserCard({
  inputClass,
  onSave,
  profile,
  profileEditing,
  relationDraft,
  setProfileEditing,
  setRelationDraft,
  setUsernameDraft,
  user,
  usernameDraft,
  usernameSaving,
}) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-paw-muted">我的</p>
          <h1 className="mt-1 truncate font-title text-xl font-semibold">
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
      <div className="mt-3 rounded-control bg-paw-background px-3 py-2.5">
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
            <input className={`${inputClass} mt-1`} onChange={(event) => setUsernameDraft(event.target.value)} placeholder="设置昵称" value={usernameDraft} />
          </label>
          <label className="block text-xs font-semibold text-paw-secondary">
            宠物对你的称呼
            <input className={`${inputClass} mt-1`} onChange={(event) => setRelationDraft(event.target.value)} placeholder="妈妈、爸爸、姐姐、铲屎官..." value={relationDraft} />
          </label>
          <button
            className="w-full rounded-control bg-paw-primary px-4 py-2.5 text-sm font-semibold text-paw-background disabled:opacity-50"
            disabled={usernameSaving}
            onClick={onSave}
            type="button"
          >
            保存个人资料
          </button>
        </div>
      )}
    </section>
  );
}

export default ProfileUserCard;
