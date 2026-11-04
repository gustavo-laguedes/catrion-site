import { useState, type FormEvent } from 'react';
import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { SectionEyebrow } from '../components/SectionEyebrow';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

type ContactFormState = {
  name: string;
  company: string;
  contact: string;
  message: string;
};

const initialFormState: ContactFormState = { name: '', company: '', contact: '', message: '' };

const channels = [
  { label: 'E-mail', value: 'catrion.tec@gmail.com', href: 'mailto:catrion.tec@gmail.com' },
  { label: 'WhatsApp', value: '+55 (12) 99777-0044', href: 'https://wa.me/message/WBSMS7O2F3AUK1' },
  { label: 'Instagram', value: '@catrionoficial', href: 'https://instagram.com/catrionoficial' },
  { label: 'LinkedIn', value: 'Catrion Tecnologia e Criação', href: 'https://www.linkedin.com/company/catriontech/' }
];

export function ContactPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  function updateField(field: keyof ContactFormState, value: string) {
    setFormData((current) => ({ ...current, [field]: value }));
    setFeedback('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
      setFeedback('Preencha nome, contato e mensagem.');
      return;
    }

    setIsLoading(true);
    setFeedback('');
    try {
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(data?.message ?? 'Não foi possível enviar sua mensagem agora.');
      setFormData(initialFormState);
      setFeedback(data?.message ?? 'Mensagem recebida com sucesso.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível enviar sua mensagem agora.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Section contentClassName="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
      <div>
        <SectionEyebrow>Contato</SectionEyebrow>
        <h1 className="type-heading mt-6">Vamos conversar sobre o seu projeto.</h1>
        <p className="type-body mt-6 max-w-xl text-muted-foreground">Conte o que você quer construir e quais desafios precisa resolver. Pensamos a solução considerando o seu negócio como um todo.</p>
        <address className="mt-12 grid gap-5 not-italic">
          {channels.map((channel) => (
            <div key={channel.label} className="border-b border-border pb-4">
              <p className="type-micro text-muted-foreground">{channel.label}</p>
              <a
                href={channel.href}
                target={channel.href.startsWith('https:') ? '_blank' : undefined}
                rel={channel.href.startsWith('https:') ? 'noopener noreferrer' : undefined}
                className="type-label mt-2 inline-block break-all hover:text-accent"
              >
                {channel.value}
              </a>
            </div>
          ))}
        </address>
      </div>

      <form onSubmit={handleSubmit} className="self-start border border-border bg-surface p-6 sm:p-8">
        <h2 className="type-subheading">Conte sua ideia</h2>
        <p className="type-body mt-3 text-muted-foreground">Retornaremos pelo contato informado.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <label className="type-label grid gap-2">
            Nome
            <input className="field" type="text" autoComplete="name" placeholder="Seu nome" value={formData.name} maxLength={120} required onChange={(event) => updateField('name', event.target.value)} />
          </label>
          <label className="type-label grid gap-2">
            <span>Empresa <span className="font-normal text-muted-foreground">(opcional)</span></span>
            <input className="field" type="text" autoComplete="organization" placeholder="Nome da empresa" value={formData.company} maxLength={160} onChange={(event) => updateField('company', event.target.value)} />
          </label>
          <label className="type-label grid gap-2 sm:col-span-2">
            E-mail ou WhatsApp
            <input className="field" type="text" placeholder="Como podemos falar com você" value={formData.contact} maxLength={180} required onChange={(event) => updateField('contact', event.target.value)} />
          </label>
          <label className="type-label grid gap-2 sm:col-span-2">
            Mensagem
            <textarea className="field min-h-36 resize-y" placeholder="Conte rapidamente sobre o seu projeto" value={formData.message} maxLength={2000} required onChange={(event) => updateField('message', event.target.value)} />
          </label>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-5">
          <p className="type-label text-muted-foreground" aria-live="polite">{feedback}</p>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : 'Enviar mensagem'}</Button>
        </div>
      </form>
    </Section>
  );
}
