const partners = [
  {
    name: 'Clube do Suplemento',
    logo: '/parceiro-clube-do-suplemento.png',
    href: 'https://www.instagram.com/clube_dosuplemento/'
  },
  {
    name: 'Aço-Fer',
    logo: '/parceiro-aco-fer.png',
    href: 'https://www.instagram.com/acoferoficial/'
  },
  {
    name: 'Jardim',
    logo: '/parceiro-jardim.png',
    href: 'https://www.instagram.com/_jardim.ca/'
  }
];

export function PartnersChapter() {
  return (
    <section id="parceiros" className="partners-chapter" aria-labelledby="partners-title">
      <div className="partners-intro">
        <p className="chapter-index">04 / Parceiros</p>
        <h2 id="partners-title">Parcerias<br />que movem negócios.</h2>
      </div>
      <div className="partners-list">
        {partners.map((partner, index) => (
          <a
            key={partner.name}
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="partner-entry"
            aria-label={`Abrir Instagram de ${partner.name} em nova aba`}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span className="partner-entry__logo">
              <img src={partner.logo} alt="" loading="lazy" />
            </span>
            <strong>{partner.name}</strong>
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}
