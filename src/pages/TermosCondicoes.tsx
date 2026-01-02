import React from 'react';
import SEOHead from '@/components/SEOHead';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const TermosCondicoes: React.FC = () => {
  return (
    <Layout>
      <SEOHead
        title="Termos e Condições de Uso – Ganhavel"
        description="Termos e Condições de Uso da plataforma Ganhavel. Leia atentamente antes de utilizar nossos serviços de sorteios e promoções."
        canonical="https://ganhavel.com/termos-e-condicoes"
        noindex={false}
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Termos e Condições de Uso
              </h1>
              <p className="text-muted-foreground text-lg">
                Última atualização: Janeiro de 2026
              </p>
            </header>

            <div className="space-y-8 text-foreground/90">
              {/* Introdução */}
              <section>
                <p className="text-lg leading-relaxed">
                  Bem-vindo à <strong>Ganhavel</strong>. Estes Termos e Condições de Uso ("Termos") regem o acesso e a utilização do site <a href="https://ganhavel.com" className="text-primary hover:underline">https://ganhavel.com</a>, aplicativos móveis e todos os serviços oferecidos pela <strong>GANHAVEL TECNOLOGIA LTDA</strong> ("Ganhavel", "Plataforma", "nós" ou "nosso").
                </p>
                <p className="text-lg leading-relaxed mt-4">
                  Ao acessar ou utilizar a Plataforma, você ("Usuário", "você") declara ter lido, compreendido e concordado integralmente com estes Termos. Caso não concorde, não utilize nossos serviços.
                </p>
              </section>

              {/* 1. Definições */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  1. Definições
                </h2>
                <p>Para os fins destes Termos, considera-se:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Plataforma:</strong> o site, aplicativos móveis e sistemas operados pela Ganhavel.</li>
                  <li><strong>Usuário:</strong> qualquer pessoa física que acessa ou utiliza a Plataforma.</li>
                  <li><strong>Participante:</strong> Usuário que adquire bilhetes ou entradas em sorteios/campanhas.</li>
                  <li><strong>Organizador:</strong> Usuário que cria e gerencia sorteios, promoções ou campanhas na Plataforma.</li>
                  <li><strong>Sorteio/Campanha:</strong> ação promocional criada por Organizadores para distribuição de prêmios.</li>
                  <li><strong>Bilhete/Entrada:</strong> direito de participação em um sorteio ou campanha.</li>
                  <li><strong>Prêmio:</strong> bem, serviço ou valor oferecido pelo Organizador ao vencedor.</li>
                  <li><strong>Conta:</strong> registro do Usuário na Plataforma com credenciais de acesso.</li>
                </ul>
              </section>

              {/* 2. Aceitação dos Termos */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  2. Aceitação dos Termos
                </h2>
                <p>
                  Ao acessar a Plataforma via navegador web ou aplicativo móvel, criar uma Conta, participar de sorteios ou utilizar qualquer funcionalidade, você concorda com estes Termos e com nossa <Link to="/politica-de-privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
                </p>
                <p className="mt-4">
                  Estes Termos aplicam-se igualmente a usuários que acessam via:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Website (desktop ou mobile)</li>
                  <li>Aplicativo iOS</li>
                  <li>Aplicativo Android</li>
                  <li>Qualquer outra interface disponibilizada pela Ganhavel</li>
                </ul>
              </section>

              {/* 3. Sobre a Ganhavel e Seu Papel de Intermediário */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  3. Sobre a Ganhavel e Seu Papel de Intermediário
                </h2>
                
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 my-4 rounded-r">
                  <p className="font-bold text-destructive-foreground">
                    ⚠️ IMPORTANTE: LEIA COM ATENÇÃO
                  </p>
                </div>

                <p className="font-medium">
                  A Ganhavel atua <strong>EXCLUSIVAMENTE</strong> como plataforma intermediária entre Organizadores e Participantes. A Ganhavel:
                </p>
                
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li><strong>NÃO é organizadora</strong> de sorteios, promoções ou campanhas</li>
                  <li><strong>NÃO garante</strong> a entrega de prêmios</li>
                  <li><strong>NÃO é responsável</strong> pela legalidade das campanhas criadas por Organizadores</li>
                  <li><strong>NÃO controla</strong> os resultados dos sorteios</li>
                  <li><strong>NÃO verifica</strong> a existência, qualidade ou disponibilidade dos prêmios</li>
                  <li><strong>NÃO se responsabiliza</strong> por ações ou omissões dos Organizadores</li>
                </ul>

                <p className="mt-4">
                  A Ganhavel fornece apenas a infraestrutura tecnológica para que Organizadores criem campanhas e Participantes possam aderir. Toda responsabilidade pela campanha, prêmios, legalidade e entrega recai sobre o Organizador.
                </p>
              </section>

              {/* 4. Elegibilidade do Usuário */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  4. Elegibilidade do Usuário
                </h2>
                <p>Para utilizar a Plataforma, o Usuário deve:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ter no mínimo <strong>18 (dezoito) anos de idade</strong></li>
                  <li>Possuir capacidade civil plena</li>
                  <li>Fornecer informações verdadeiras, completas e atualizadas</li>
                  <li>Não estar impedido por lei ou regulamento de participar de sorteios</li>
                  <li>Não ter sido previamente banido ou suspenso da Plataforma</li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Ao se cadastrar, você declara atender a todos os requisitos acima.
                </p>
              </section>

              {/* 5. Contas e Cadastro */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  5. Contas e Cadastro
                </h2>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">5.1 Criação de Conta</h3>
                <p>
                  Para participar de sorteios ou criar campanhas, é necessário criar uma Conta. O cadastro pode ser feito por e-mail/senha ou via login social (ex.: Google).
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.2 Responsabilidade pela Conta</h3>
                <p>O Usuário é integralmente responsável por:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Manter suas credenciais em sigilo</li>
                  <li>Todas as atividades realizadas com sua Conta</li>
                  <li>Notificar imediatamente a Ganhavel sobre uso não autorizado</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">5.3 Veracidade das Informações</h3>
                <p>
                  O Usuário declara que todas as informações fornecidas são verdadeiras. Informações falsas podem resultar em suspensão ou encerramento da Conta.
                </p>
              </section>

              {/* 6. Sorteios, Promoções e Responsabilidades do Organizador */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  6. Sorteios, Promoções e Responsabilidades do Organizador
                </h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Criação de Campanhas</h3>
                <p>
                  Organizadores podem criar sorteios e promoções na Plataforma, definindo regras, prêmios, prazos e condições.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Responsabilidades Exclusivas do Organizador</h3>
                <p>O Organizador é <strong>integral e exclusivamente responsável</strong> por:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Garantir a <strong>legalidade</strong> da campanha conforme legislação brasileira</li>
                  <li>Obter eventuais <strong>autorizações necessárias</strong> junto a órgãos competentes</li>
                  <li>Possuir o <strong>prêmio anunciado</strong> ou condições de adquiri-lo</li>
                  <li><strong>Entregar o prêmio</strong> ao vencedor nos termos da campanha</li>
                  <li>Prestar <strong>suporte aos Participantes</strong> sobre questões da campanha</li>
                  <li>Arcar com <strong>tributos e obrigações fiscais</strong> aplicáveis</li>
                  <li>Responder por quaisquer <strong>reclamações ou processos</strong> relacionados à campanha</li>
                </ul>

                <div className="bg-accent/50 border-l-4 border-primary p-4 my-4 rounded-r">
                  <p className="font-medium">
                    A Ganhavel recomenda que Organizadores consultem assessoria jurídica antes de criar campanhas.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Participação em Sorteios</h3>
                <p>
                  Ao participar de um sorteio, o Participante aceita as regras específicas definidas pelo Organizador e reconhece que:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A Ganhavel não garante a entrega do prêmio</li>
                  <li>O Organizador é o único responsável pela campanha</li>
                  <li>Eventuais disputas devem ser resolvidas diretamente com o Organizador</li>
                </ul>
              </section>

              {/* 7. Pagamentos, Taxas e Processadores */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  7. Pagamentos, Taxas e Processadores
                </h2>

                <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Processamento de Pagamentos</h3>
                <p>
                  Os pagamentos realizados na Plataforma são processados por <strong>provedores terceirizados</strong> (gateways de pagamento), como instituições financeiras e processadores de Pix.
                </p>
                
                <div className="bg-accent/50 border-l-4 border-primary p-4 my-4 rounded-r">
                  <p className="font-medium">
                    A Ganhavel <strong>não armazena</strong> dados completos de cartões de crédito ou contas bancárias.
                  </p>
                </div>

                <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Taxas</h3>
                <p>
                  A Ganhavel pode cobrar taxas de serviço sobre transações, conforme informado no momento da compra ou criação de campanhas.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">7.3 Reembolsos</h3>
                <p>
                  Políticas de reembolso são definidas conforme a natureza da transação e regras da campanha. Solicitações devem ser direcionadas ao suporte.
                </p>
              </section>

              {/* 8. Entrega de Prêmios */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  8. Entrega de Prêmios e Responsabilidade do Organizador
                </h2>
                
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 my-4 rounded-r">
                  <p className="font-bold">
                    A entrega de prêmios é de <strong>responsabilidade exclusiva do Organizador</strong>.
                  </p>
                </div>

                <p>A Ganhavel:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Não custodia, armazena ou transporta prêmios</li>
                  <li>Não garante qualidade, existência ou disponibilidade de prêmios</li>
                  <li>Não é responsável por atrasos, defeitos ou não entrega</li>
                  <li>Não media disputas sobre entrega de prêmios</li>
                </ul>

                <p className="mt-4">
                  Em caso de problemas com a entrega, o Participante deve contatar diretamente o Organizador.
                </p>
              </section>

              {/* 9. Condutas Proibidas e Prevenção a Fraudes */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  9. Condutas Proibidas e Prevenção a Fraudes
                </h2>
                <p>É expressamente proibido:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fornecer informações falsas ou enganosas</li>
                  <li>Criar múltiplas contas para fraudar campanhas</li>
                  <li>Utilizar bots, scripts ou automações não autorizadas</li>
                  <li>Manipular resultados de sorteios</li>
                  <li>Criar campanhas falsas ou sem intenção de entregar prêmios</li>
                  <li>Violar direitos de propriedade intelectual de terceiros</li>
                  <li>Praticar qualquer atividade ilegal ou que viole estes Termos</li>
                  <li>Assediar, ameaçar ou prejudicar outros usuários</li>
                  <li>Utilizar a Plataforma para lavagem de dinheiro ou atividades ilícitas</li>
                </ul>

                <p className="mt-4">
                  A Ganhavel utiliza sistemas de monitoramento e detecção de fraudes e pode tomar medidas preventivas a seu exclusivo critério.
                </p>
              </section>

              {/* 10. Suspensão, Remoção de Conteúdo e Encerramento */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  10. Suspensão, Remoção de Conteúdo e Encerramento de Conta
                </h2>
                <p>A Ganhavel reserva-se o direito de, a seu exclusivo critério e sem aviso prévio:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Suspender ou encerrar Contas</li>
                  <li>Remover sorteios ou campanhas</li>
                  <li>Bloquear transações suspeitas</li>
                  <li>Reter valores em investigação de fraudes</li>
                  <li>Limitar funcionalidades da Conta</li>
                </ul>
                <p className="mt-4">
                  Tais ações podem ser tomadas em caso de violação destes Termos, suspeita de fraude, ordem judicial ou para proteger a Plataforma e seus usuários.
                </p>
              </section>

              {/* 11. Limitação de Responsabilidade */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  11. Limitação de Responsabilidade
                </h2>
                
                <p className="font-medium">
                  NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI, A GANHAVEL NÃO SERÁ RESPONSÁVEL POR:
                </p>
                
                <ul className="list-disc pl-6 space-y-2 mt-4">
                  <li>Danos diretos, indiretos, incidentais, especiais ou consequenciais</li>
                  <li>Perda de lucros, dados, oportunidades ou expectativas</li>
                  <li>Ações ou omissões de Organizadores ou Participantes</li>
                  <li>Não entrega, atraso ou defeitos em prêmios</li>
                  <li>Interrupções, falhas ou erros na Plataforma</li>
                  <li>Ataques cibernéticos, vírus ou invasões</li>
                  <li>Conteúdo publicado por terceiros</li>
                  <li>Disputas entre Organizadores e Participantes</li>
                </ul>

                <p className="mt-4">
                  Em qualquer hipótese, a responsabilidade da Ganhavel será limitada ao valor pago pelo Usuário nos últimos 12 meses.
                </p>
              </section>

              {/* 12. Indenização */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  12. Indenização
                </h2>
                <p>
                  O Usuário concorda em indenizar, defender e isentar a Ganhavel, seus diretores, funcionários, agentes e parceiros de quaisquer reclamações, perdas, danos, custos e despesas (incluindo honorários advocatícios) decorrentes de:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violação destes Termos</li>
                  <li>Uso indevido da Plataforma</li>
                  <li>Violação de direitos de terceiros</li>
                  <li>Informações falsas ou enganosas fornecidas</li>
                  <li>Campanhas criadas pelo Usuário (se Organizador)</li>
                </ul>
              </section>

              {/* 13. Propriedade Intelectual */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  13. Propriedade Intelectual
                </h2>
                <p>
                  Todo o conteúdo da Plataforma, incluindo mas não se limitando a logotipos, marcas, textos, imagens, código, design e funcionalidades, é de propriedade exclusiva da Ganhavel ou de seus licenciantes.
                </p>
                <p className="mt-4">
                  É proibida a reprodução, distribuição, modificação ou uso comercial sem autorização prévia e por escrito.
                </p>
                <p className="mt-4">
                  Ao publicar conteúdo na Plataforma, o Usuário concede à Ganhavel licença não exclusiva, mundial, gratuita e sublicenciável para uso, reprodução e exibição desse conteúdo.
                </p>
              </section>

              {/* 14. Alterações dos Termos */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  14. Alterações dos Termos
                </h2>
                <p>
                  A Ganhavel pode modificar estes Termos a qualquer momento. As alterações entrarão em vigor após publicação na Plataforma.
                </p>
                <p className="mt-4">
                  O uso continuado após a publicação de alterações constitui aceitação dos novos Termos. Recomendamos revisão periódica.
                </p>
                <p className="mt-4">
                  Para alterações significativas, poderemos notificar os Usuários por e-mail ou aviso na Plataforma.
                </p>
              </section>

              {/* 15. Lei Aplicável e Foro */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  15. Lei Aplicável e Foro
                </h2>
                <p>
                  Estes Termos são regidos pela legislação da <strong>República Federativa do Brasil</strong>.
                </p>
                <p className="mt-4">
                  Fica eleito o foro da Comarca de <strong>São Paulo/SP</strong> para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por mais privilegiado que seja.
                </p>
                <p className="mt-4">
                  As partes podem optar por mediação ou arbitragem para resolução de disputas, conforme regulamentação aplicável.
                </p>
              </section>

              {/* 16. Disposições Gerais */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  16. Disposições Gerais
                </h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Integralidade:</strong> Estes Termos, juntamente com a Política de Privacidade, constituem o acordo integral entre as partes.</li>
                  <li><strong>Independência:</strong> A invalidade de qualquer cláusula não afeta as demais.</li>
                  <li><strong>Tolerância:</strong> A não exigência de qualquer direito não constitui renúncia.</li>
                  <li><strong>Cessão:</strong> O Usuário não pode ceder estes Termos. A Ganhavel pode ceder livremente.</li>
                </ul>
              </section>

              {/* Contato */}
              <section>
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
                  17. Contato
                </h2>
                <p>Em caso de dúvidas sobre estes Termos:</p>
                <div className="bg-accent/50 p-6 rounded-lg mt-4">
                  <p className="text-lg">
                    📧 <a href="mailto:suporte@ganhavel.com" className="text-primary hover:underline font-medium">suporte@ganhavel.com</a>
                  </p>
                  <p className="text-lg mt-2">
                    🌐 <a href="https://ganhavel.com" className="text-primary hover:underline font-medium">https://ganhavel.com</a>
                  </p>
                </div>
              </section>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-center text-muted-foreground">
                  Ao utilizar a Ganhavel, você declara ter lido e concordado com estes Termos e Condições de Uso.
                </p>
                <p className="text-center mt-4">
                  <Link to="/politica-de-privacidade" className="text-primary hover:underline">
                    Consulte também nossa Política de Privacidade →
                  </Link>
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default TermosCondicoes;
