import React from 'react';
import SEOHead from '@/components/SEOHead';
import Layout from '@/components/Layout';

const PoliticaPrivacidade: React.FC = () => {
  return (
    <Layout>
      <SEOHead
        title="Política de Privacidade – Ganhavel"
        description="Política de Privacidade da Ganhavel. Saiba como coletamos, usamos, armazenamos e protegemos seus dados pessoais em conformidade com LGPD e GDPR."
        canonical="https://ganhavel.com/politica-de-privacidade"
        noindex={false}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground text-lg">
                Última atualização: Dezembro de 2025
              </p>
            </header>

            <div className="space-y-8 text-foreground/90">
              <section>
                <p className="text-lg leading-relaxed">
                  A <strong>GANHAVEL TECNOLOGIA LTDA</strong>, doravante denominada apenas "Ganhavel", "Plataforma", "nós" ou "nosso", respeita a privacidade dos usuários e está comprometida com a proteção dos dados pessoais tratados em suas operações.
                </p>
                <p className="text-lg leading-relaxed">
                  Esta Política de Privacidade descreve, de forma transparente e detalhada, como os dados pessoais são coletados, utilizados, armazenados, compartilhados e protegidos, em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 – LGPD)</strong>, o <strong>Regulamento Geral de Proteção de Dados da União Europeia (GDPR)</strong> e demais normas aplicáveis.
                </p>
                <p className="text-lg leading-relaxed">
                  Ao acessar ou utilizar o site <a href="https://ganhavel.com" className="text-primary hover:underline">https://ganhavel.com</a>, aplicativos, sistemas ou serviços da Ganhavel, o usuário declara ter lido, compreendido e concordado com esta Política.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  1. Definições Importantes
                </h2>
                <p>Para fins desta Política:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Dados Pessoais:</strong> qualquer informação relacionada a pessoa natural identificada ou identificável.</li>
                  <li><strong>Titular:</strong> pessoa natural a quem os dados pessoais se referem.</li>
                  <li><strong>Tratamento:</strong> toda operação realizada com dados pessoais (coleta, uso, armazenamento, compartilhamento, exclusão etc.).</li>
                  <li><strong>Controlador:</strong> a Ganhavel, responsável pelas decisões sobre o tratamento dos dados.</li>
                  <li><strong>Operador:</strong> terceiro que trata dados em nome da Ganhavel.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  2. Quem Somos
                </h2>
                <ul className="list-none space-y-2">
                  <li><strong>Nome da plataforma:</strong> Ganhavel</li>
                  <li><strong>Website:</strong> <a href="https://ganhavel.com" className="text-primary hover:underline">https://ganhavel.com</a></li>
                  <li><strong>E-mail de contato:</strong> <a href="mailto:suporte@ganhavel.com" className="text-primary hover:underline">suporte@ganhavel.com</a></li>
                </ul>
                <p className="mt-4">
                  A Ganhavel é uma plataforma digital que permite a participação em sorteios, promoções, campanhas interativas e experiências digitais, operando de forma online.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  3. Dados Pessoais Coletados
                </h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Dados Fornecidos Diretamente pelo Usuário</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Número de telefone</li>
                  <li>Foto de perfil</li>
                  <li>Dados de autenticação (login e senha criptografados)</li>
                  <li>Informações fornecidas em formulários, comunicações ou suporte</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Dados Coletados Automaticamente</h3>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Endereço IP</li>
                  <li>Geolocalização aproximada</li>
                  <li>Tipo de dispositivo</li>
                  <li>Navegador e sistema operacional</li>
                  <li>Datas, horários e duração de acesso</li>
                  <li>Páginas visitadas e interações na plataforma</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Dados de Pagamento</h3>
                <p>Informações relacionadas a transações financeiras.</p>
                <div className="bg-accent/50 border-l-4 border-primary p-4 my-4 rounded-r">
                  <p className="font-medium">
                    ⚠️ A Ganhavel <strong>não armazena</strong> dados completos de cartão de crédito. Os pagamentos são processados por provedores terceirizados certificados, que seguem padrões de segurança próprios.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">3.4 Dados de Login Social</h3>
                <p>Quando o usuário opta por login via terceiros (ex.: Google), podemos receber:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Nome</li>
                  <li>E-mail</li>
                  <li>Foto de perfil</li>
                </ul>
                <p className="mt-2 text-muted-foreground">
                  Conforme autorizado pelo próprio usuário no momento da autenticação.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  4. Finalidades do Tratamento
                </h2>
                <p>Os dados pessoais são utilizados para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criar, autenticar e gerenciar contas de usuário</li>
                  <li>Permitir a participação em sorteios e campanhas</li>
                  <li>Processar pagamentos e transações</li>
                  <li>Enviar comunicações operacionais, notificações e suporte</li>
                  <li>Garantir segurança, prevenção a fraudes e abusos</li>
                  <li>Cumprir obrigações legais e regulatórias</li>
                  <li>Melhorar desempenho, usabilidade e experiência da plataforma</li>
                  <li>Realizar análises estatísticas e operacionais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  5. Base Legal do Tratamento (LGPD / GDPR)
                </h2>
                <p>O tratamento de dados ocorre com base em:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Consentimento do titular</li>
                  <li>Execução de contrato</li>
                  <li>Cumprimento de obrigação legal ou regulatória</li>
                  <li>Legítimo interesse, respeitando direitos e expectativas do usuário</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  6. Cookies e Tecnologias Semelhantes
                </h2>
                <p>Utilizamos cookies e tecnologias similares para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Autenticação e segurança</li>
                  <li>Funcionamento correto da plataforma</li>
                  <li>Análise de desempenho e comportamento de navegação</li>
                  <li>Personalização da experiência do usuário</li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  O usuário pode, a qualquer momento, configurar seu navegador para bloquear cookies. Algumas funcionalidades poderão ser afetadas.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  7. Compartilhamento de Dados
                </h2>
                <div className="bg-accent/50 border-l-4 border-primary p-4 my-4 rounded-r">
                  <p className="font-medium">
                    A Ganhavel <strong>não vende, aluga ou comercializa</strong> dados pessoais.
                  </p>
                </div>
                <p>Os dados podem ser compartilhados apenas com:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provedores de tecnologia, hospedagem e infraestrutura</li>
                  <li>Processadores de pagamento</li>
                  <li>Ferramentas de autenticação (ex.: Google OAuth)</li>
                  <li>Autoridades legais, mediante obrigação legal ou ordem judicial</li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Todos os parceiros seguem padrões adequados de proteção de dados.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  8. Transferência Internacional de Dados
                </h2>
                <p>
                  Os dados pessoais podem ser armazenados ou processados em servidores localizados fora do Brasil, incluindo Estados Unidos e União Europeia.
                </p>
                <p className="mt-4">Nesses casos, a Ganhavel garante:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cláusulas contratuais adequadas</li>
                  <li>Medidas de segurança compatíveis com a LGPD e GDPR</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  9. Segurança da Informação
                </h2>
                <p>Adotamos medidas técnicas e organizacionais apropriadas, incluindo:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criptografia</li>
                  <li>Controle de acesso</li>
                  <li>Monitoramento contínuo</li>
                  <li>Infraestrutura segura em nuvem</li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Apesar de todos os esforços, nenhum sistema é totalmente inviolável.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  10. Retenção e Exclusão dos Dados
                </h2>
                <p>Os dados pessoais serão mantidos:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pelo tempo necessário para cumprir as finalidades</li>
                  <li>Para atender exigências legais, fiscais ou regulatórias</li>
                </ul>
                <p className="mt-4">
                  Após esse período, os dados serão excluídos ou anonimizados de forma segura.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  11. Direitos do Titular
                </h2>
                <p>O usuário pode solicitar, a qualquer momento:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Confirmação do tratamento de dados</li>
                  <li>Acesso aos dados</li>
                  <li>Correção de dados</li>
                  <li>Exclusão ou anonimização</li>
                  <li>Portabilidade, quando aplicável</li>
                  <li>Revogação do consentimento</li>
                </ul>
                <p className="mt-4">
                  Solicitações devem ser enviadas para: <a href="mailto:suporte@ganhavel.com" className="text-primary hover:underline font-medium">suporte@ganhavel.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  12. Privacidade de Menores
                </h2>
                <p>
                  A Ganhavel <strong>não é destinada a menores de 18 anos</strong>. Caso seja identificado tratamento indevido de dados de menores, estes serão imediatamente removidos.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  13. Responsabilidades do Usuário
                </h2>
                <p>O usuário é responsável por:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Manter suas credenciais seguras</li>
                  <li>Informar dados verdadeiros e atualizados</li>
                  <li>Não compartilhar acesso com terceiros</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  14. Alterações desta Política
                </h2>
                <p>
                  Esta Política poderá ser alterada a qualquer momento. As alterações entrarão em vigor após publicação no site.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Recomendamos revisão periódica.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  15. Canal de Contato
                </h2>
                <p>Em caso de dúvidas, solicitações ou reclamações:</p>
                <div className="bg-accent/50 p-6 rounded-lg mt-4">
                  <p className="text-lg">
                    📧 <a href="mailto:suporte@ganhavel.com" className="text-primary hover:underline font-medium">suporte@ganhavel.com</a>
                  </p>
                </div>
              </section>

              <div className="mt-12 pt-8 border-t border-border text-center text-muted-foreground">
                <p>
                  Este documento está pronto para Google Verification, gateways de pagamento, auditorias jurídicas, investidores e App Store / Play Store.
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default PoliticaPrivacidade;
