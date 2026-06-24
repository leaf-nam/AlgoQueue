import { useEffect, useState } from 'react';
import { api } from '../api';
import type { ProblemSetting, Problem, Language, Difficulty } from '../types';
import { DiffBadge, LangBadge, Loading, Empty, Modal, LANG_LABEL } from '../components/shared';
import { useToast } from '../hooks/useToast';

const USER_ID = 1;
const LANGS: Language[] = ['JAVA', 'CPP', 'PYTHON', 'KOTLIN'];
const DIFFS: Difficulty[] = ['VERY_EASY','EASY','MEDIUM','HARD','VERY_HARD'];
const DIFF_LABEL = { VERY_EASY:'Very Easy', EASY:'Easy', MEDIUM:'Medium', HARD:'Hard', VERY_HARD:'Very Hard' };

export default function SettingsPage() {
  const [settings, setSettings] = useState<ProblemSetting[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing]   = useState<ProblemSetting | null>(null);
  const [form, setForm]         = useState({
    problemId: '' as number | '', language: 'JAVA' as Language,
    targetTime: 30, difficulty: '' as Difficulty | '',
  });
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      api.settings.list(USER_ID),
      api.problems.list({ hidden: false }),
    ]).then(([s, p]) => { setSettings(s); setProblems(p); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      if (modal === 'create') {
        await api.settings.create(USER_ID, {
          problemId:  Number(form.problemId),
          language:   form.language,
          targetTime: form.targetTime,
          difficulty: form.difficulty as Difficulty || undefined,
        });
        toast('설정이 저장되었습니다.', 'success');
      } else if (editing) {
        await api.settings.update(USER_ID, editing.problemId, {
          language:   form.language,
          targetTime: form.targetTime,
          difficulty: form.difficulty as Difficulty || undefined,
        });
        toast('설정이 수정되었습니다.', 'success');
      }
      setModal(null);
      load();
    } catch (e: any) { toast(e.message, 'error'); }
  };

  const openEdit = (s: ProblemSetting) => {
    setEditing(s);
    setForm({ problemId: s.problemId, language: s.language, targetTime: s.targetTime, difficulty: s.difficulty ?? '' });
    setModal('edit');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">문제 설정</div>
          <div className="page-subtitle">// TARGET TIME & LANGUAGE PER PROBLEM</div>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditing(null);
          setForm({ problemId: '', language: 'JAVA', targetTime: 30, difficulty: '' });
          setModal('create');
        }}>+ 설정 추가</button>
      </div>

      <div className="card">
        {loading ? <Loading /> : settings.length === 0
          ? <Empty icon="⚙️" message="설정된 문제가 없습니다." />
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>문제</th><th>카테고리</th><th>언어</th><th>목표 시간</th><th>체감 난이도</th><th>액션</th></tr>
                </thead>
                <tbody>
                  {settings.map(s => (
                    <tr key={s.id}>
                      <td className="primary">{s.problemTitle}</td>
                      <td className="text-muted">{s.categoryName}</td>
                      <td><LangBadge lang={s.language} /></td>
                      <td className="text-mono">{s.targetTime}분</td>
                      <td><DiffBadge diff={s.difficulty} /></td>
                      <td>
                        <button className="btn btn-icon btn-sm" onClick={() => openEdit(s)}>✎</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {modal && (
        <Modal title={modal === 'create' ? '설정 추가' : '설정 수정'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-3">
            {modal === 'create' && (
              <div className="form-group">
                <label className="form-label">문제</label>
                <select className="form-select" value={form.problemId}
                  onChange={e => setForm(f => ({ ...f, problemId: Number(e.target.value) }))}>
                  <option value="">선택</option>
                  {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">풀이 언어</label>
                <select className="form-select" value={form.language}
                  onChange={e => setForm(f => ({ ...f, language: e.target.value as Language }))}>
                  {LANGS.map(l => <option key={l} value={l}>{LANG_LABEL[l]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">목표 시간 (분)</label>
                <input className="form-input" type="number" min={1} value={form.targetTime}
                  onChange={e => setForm(f => ({ ...f, targetTime: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">체감 난이도 (선택)</label>
              <select className="form-select" value={form.difficulty}
                onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as Difficulty }))}>
                <option value="">미지정</option>
                {DIFFS.map(d => <option key={d} value={d}>{DIFF_LABEL[d]}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>취소</button>
              <button className="btn btn-primary" onClick={submit}>저장</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
