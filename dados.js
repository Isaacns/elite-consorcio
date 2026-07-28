/* VIZIO · Gerenciador de Consórcio — configuração da instância (modo SUPABASE)
   Login real (e-mail + senha) e dados na nuvem (tabelas cs_*).
   Os arrays começam vazios: carregados do Supabase após o login.
   ⚠️ TODO (provisionamento): preencher supabaseUrl/supabaseKey do projeto novo
      "vizio-consorcio" e a assinaturaUrl (checkout Stripe do produto Consórcio).
      A publishable key é pública por design; NÃO colocar service role key aqui. */
const DADOS = {
  _meta: { produto: "Gerenciador de Consórcio", instancia: "Elite Consultoria e Consórcios", fonte: "Supabase", gerado: "03/07/2026" },
  _cfg: {
    produto: "Gerenciador de Consórcio",
    instancia: "Elite Consultoria e Consórcios",
    propLabel: "Consorciado",
    trialDays: 0,
    // Projeto Supabase DEDICADO da Elite: elite-consorcio (sa-east-1, ref wcjvmgmxizhwaolyusvx).
    supabaseUrl: "https://wcjvmgmxizhwaolyusvx.supabase.co",
    supabaseKey: "sb_publishable_nIg3tcSJqvOy_tsaVneMNw_qbdrP7Hj",
    // Token padrão do link curto de auto-cadastro (single-org). O base multi-empresa NÃO define isto (usa ?t=).
    cadastroToken: "61874307-d568-4aee-adb6-f3de7f03342e",
    // TODO: link de checkout do produto "Vizio Consórcio — Mensal" (Stripe)
    assinaturaUrl: "https://buy.stripe.com/PREENCHER"
  },
  // Coleções cs_* — carregadas após login (RLS por user_id).
  cotas: [],
  parcelas: [],
  eventos: [],
  perfis: []
};
