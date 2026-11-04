import { Button } from '../components/Button';
import { Section } from '../components/Section';
import { SectionEyebrow } from '../components/SectionEyebrow';

export function NotFoundPage() {
  return (
    <Section>
      <SectionEyebrow>404</SectionEyebrow>
      <h1 className="type-heading mt-6">Página não encontrada.</h1>
      <p className="type-body mt-5 text-muted-foreground">O endereço solicitado não está disponível.</p>
      <Button to="/" variant="outline" className="mt-8">Voltar ao início</Button>
    </Section>
  );
}
