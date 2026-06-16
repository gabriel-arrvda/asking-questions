export type Flashcard = {
  id: number;
  front: string;
  back: string;
};

export const FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    front: 'Fórmula da Velocidade Média ($v_m = \\frac{\\Delta S}{\\Delta t}$)',
    back: '$v_m$ é a velocidade média, $\\Delta S$ é o deslocamento (espaço percorrido) e $\\Delta t$ é o intervalo de tempo decorrido.',
  },
  {
    id: 2,
    front: 'Segunda Lei de Newton ($F_R = m \\cdot a$)',
    back: '$F_R$ representa a força resultante, $m$ é a massa do corpo e $a$ é a aceleração adquirida.',
  },
  {
    id: 3,
    front: 'Primeira Lei de Ohm ($U = R \\cdot i$)',
    back: '$U$ é a diferença de potencial elétrico (tensão), $R$ é a resistência elétrica do dispositivo e $i$ é a intensidade da corrente elétrica.',
  },
  {
    id: 4,
    front: 'Equação Fundamental da Calorimetria ($Q = m \\cdot c \\cdot \\Delta \\theta$)',
    back: '$Q$ é a quantidade de calor trocada, $m$ é a massa, $c$ é o calor específico do material e $\\Delta \\theta$ é a variação de temperatura.',
  },
  {
    id: 5,
    front: 'Equação Fundamental da Ondulatória ($v = \\lambda \\cdot f$)',
    back: '$v$ é a velocidade de propagação da onda, $\\lambda$ é o comprimento de onda e $f$ é a frequência da onda.',
  },
  {
    id: 6,
    front: 'Fórmula da Energia Cinética ($E_c = \\frac{1}{2} m v^2$)',
    back: '$E_c$ é a energia cinética do corpo, $m$ é a massa e $v$ é a velocidade escalar.',
  },
  {
    id: 7,
    front: 'Volume de um Cilindro ($V = \\pi r^2 h$)',
    back: '$V$ é o volume total, $r$ é o raio da base circular e $h$ é a altura do cilindro.',
  },
  {
    id: 8,
    front: 'Termo Geral de uma Progressão Aritmética ($a_n = a_1 + (n - 1) \\cdot r$)',
    back: '$a_n$ é o termo de posição $n$, $a_1$ é o primeiro termo, $n$ é o número de termos e $r$ é a razão da progressão.',
  },
  {
    id: 9,
    front: 'Fórmula da Potência Mecânica ($P = \\frac{E}{\\Delta t}$)',
    back: '$P$ representa a potência, $E$ é a energia consumida ou trabalho realizado e $\\Delta t$ é o intervalo de tempo.',
  },
  {
    id: 10,
    front: 'Quantidade de Movimento ou Momento Linear ($Q = m \\cdot v$)',
    back: '$Q$ é o vetor quantidade de movimento, $m$ é a massa do objeto e $v$ é a sua velocidade.',
  },
  {
    id: 11,
    front: "Equação de Gauss para Lentes e Espelhos ($\\frac{1}{f} = \\frac{1}{p} + \\frac{1}{p'}$)",
    back: "$f$ é a distância focal, $p$ é a distância do objeto ao centro óptico e $p'$ é a distância da imagem ao centro óptico.",
  },
  {
    id: 12,
    front: 'Vergência de uma Lente ($V = \\frac{1}{f}$)',
    back: '$V$ é a vergência (medida em dioptrias) e $f$ é a distância focal da lente em metros.',
  },
  {
    id: 13,
    front: 'Fórmula da Lei de Hess para Entalpia ($\\Delta H = \\sum H_{produtos} - \\sum H_{reagentes}$)',
    back: '$\\Delta H$ é a variação de entalpia da reação, representando a diferença entre a soma das entalpias dos produtos e dos reagentes.',
  },
  {
    id: 14,
    front: 'Área de um Triângulo via Seno ($A = \\frac{1}{2} a b \\sin \\theta$)',
    back: '$A$ é a área do triângulo, $a$ e $b$ são as medidas de dois lados e $\\theta$ é o ângulo formado entre esses lados.',
  },
  {
    id: 15,
    front: 'Equação de Galileu para Queda Livre ($v^2 = 2 g h$)',
    back: '$v$ é a velocidade final, $g$ é a aceleração da gravidade e $h$ é a altura da queda.',
  },
  {
    id: 16,
    front: 'Função Horária do Espaço na Queda Livre ($S = \\frac{1}{2} g t^2$)',
    back: '$S$ é a distância percorrida, $g$ é a aceleração da gravidade e $t$ é o tempo de queda.',
  },
  {
    id: 17,
    front: 'Energia Potencial Elástica ($E_{pe} = \\frac{1}{2} k x^2$)',
    back: '$E_{pe}$ é a energia potencial elástica, $k$ é a constante elástica da mola ou corda e $x$ é a deformação sofrida.',
  },
  {
    id: 18,
    front: 'Fórmula da Densidade ($\\rho = \\frac{m}{V}$)',
    back: '$\\rho$ representa a densidade do material, $m$ é a massa e $V$ é o volume ocupado.',
  },
  {
    id: 19,
    front: 'Trabalho de uma Força Constante ($\\tau = F \\cdot d \\cdot \\cos \\theta$)',
    back: '$\\tau$ é o trabalho realizado, $F$ é o módulo da força, $d$ é o deslocamento e $\\theta$ é o ângulo entre a força e o deslocamento.',
  },
  {
    id: 20,
    front: 'Energia Potencial Gravitacional ($E_{pg} = m \\cdot g \\cdot h$)',
    back: '$E_{pg}$ é a energia potencial, $m$ é a massa, $g$ é a aceleração da gravidade e $h$ é a altura em relação ao nível de referência.',
  },
  {
    id: 21,
    front: 'Unidade de medida SI para Massa ($m$)',
    back: 'A unidade fundamental no Sistema Internacional para a massa é o quilograma ($kg$).',
  },
  {
    id: 22,
    front: 'Unidade de medida SI para Força ($F$)',
    back: 'A unidade de força no Sistema Internacional é o Newton ($N$), que equivale a $1 \\, kg \\cdot m/s^2$.',
  },
  {
    id: 23,
    front: 'Unidade de medida SI para Energia e Trabalho',
    back: 'Tanto a energia quanto o trabalho são medidos em Joules ($J$) no Sistema Internacional.',
  },
  {
    id: 24,
    front: 'Unidade de medida SI para Potência ($P$)',
    back: 'A unidade de potência é o Watt ($W$), definido como um Joule por segundo ($J/s$).',
  },
  {
    id: 25,
    front: 'Unidade de medida SI para Resistência Elétrica ($R$)',
    back: 'A resistência elétrica é medida em Ohms ($\\Omega$).',
  },
  {
    id: 26,
    front: 'Unidade de medida SI para Frequência ($f$)',
    back: 'A frequência é medida em Hertz ($Hz$), que representa ciclos por segundo ($s^{-1}$).',
  },
  {
    id: 27,
    front: 'Conversão de Velocidade: $km/h$ para $m/s$',
    back: 'Para converter de $km/h$ para $m/s$, divide-se o valor numérico por $3,6$.',
  },
  {
    id: 28,
    front: 'Valor aproximado da aceleração da gravidade ($g$) na superfície da Terra',
    back: 'O valor comumente adotado em provas de física é $g = 10 \\, m/s^2$.',
  },
  {
    id: 29,
    front: 'Fórmula Dimensional da Potência Mecânica',
    back: 'Considerando massa ($M$), comprimento ($L$) e tempo ($T$), a fórmula dimensional é $[P] = M L^2 T^{-3}$.',
  },
  {
    id: 30,
    front: 'Volume de uma Pirâmide de base quadrada ($V = \\frac{1}{3} L^2 h$)',
    back: '$V$ é o volume, $L$ é a medida do lado da base quadrada e $h$ é a altura da pirâmide.',
  },
  {
    id: 31,
    front: 'Relação de Frequência Angular ($\\omega = 2 \\pi f$)',
    back: '$\\omega$ é a frequência angular, $\\pi$ é a constante pi e $f$ é a frequência linear em Hertz.',
  },
  {
    id: 32,
    front: 'Fórmula da Pressão Hidrostática ($P = d \\cdot g \\cdot h$)',
    back: '$P$ é a pressão, $d$ é a densidade do líquido, $g$ é a gravidade e $h$ é a profundidade.',
  },
  {
    id: 33,
    front: 'Fórmula do Alcance Horizontal no Lançamento de Projéteis ($A = v_H \\cdot t_{total}$)',
    back: '$A$ é o alcance horizontal, $v_H$ é a componente horizontal da velocidade e $t_{total}$ é o tempo total de voo.',
  },
  {
    id: 34,
    front: 'Área de um Trapézio ($A = \\frac{(B + b) \\cdot h}{2}$)',
    back: '$A$ é a área, $B$ é a base maior, $b$ é a base menor e $h$ é a altura do trapézio.',
  },
  {
    id: 35,
    front: 'Unidade de Medida de Carga Elétrica no SI ($Q$)',
    back: 'A unidade de carga elétrica é o Coulomb ($C$), embora em baterias seja comum o uso de Ampère-hora ($Ah$).',
  },
  {
    id: 36,
    front: 'Significado do prefixo Mega ($M$) em unidades de medida',
    back: 'O prefixo Mega representa um fator multiplicador de um milhão ($10^6$).',
  },
  {
    id: 37,
    front: 'Significado do prefixo centi ($c$) em unidades de medida',
    back: 'O prefixo centi representa a centésima parte de uma unidade ($10^{-2}$).',
  },
  {
    id: 38,
    front: 'Significado do prefixo nano ($n$) em unidades de medida',
    back: 'O prefixo nano representa a bilionésima parte de uma unidade ($10^{-9}$).',
  },
  {
    id: 39,
    front: 'Fórmula da Energia de um Fóton ($E = h \\cdot f$)',
    back: '$E$ é a energia, $h$ é a constante de Planck e $f$ é a frequência da radiação eletromagnética.',
  },
  {
    id: 40,
    front: 'Fórmula do Empuxo (Princípio de Arquimedes) ($E = d_{liq} \\cdot V_{sub} \\cdot g$)',
    back: '$E$ é a força de empuxo, $d_{liq}$ é a densidade do líquido, $V_{sub}$ é o volume submerso e $g$ é a gravidade.',
  },
  {
    id: 41,
    front: 'Fórmula da Velocidade das Ondas Eletromagnéticas no Vácuo ($c = \\lambda \\cdot f$)',
    back: '$c$ é a velocidade da luz (aprox. $3 \\times 10^8 \\, m/s$), $\\lambda$ é o comprimento de onda e $f$ é a frequência.',
  },
  {
    id: 42,
    front: 'Fórmula da Resistência Elétrica de um fio (Segunda Lei de Ohm) ($R = \\rho \\frac{L}{A}$)',
    back: '$R$ é a resistência, $\\rho$ é a resistividade do material, $L$ é o comprimento do fio e $A$ é a área da seção transversal.',
  },
  {
    id: 43,
    front: 'Fórmula do Rendimento de uma Máquina ($\\eta = \\frac{E_{util}}{E_{total}}$)',
    back: '$\\eta$ (letra grega eta) é o rendimento, $E_{util}$ é a energia útil aproveitada e $E_{total}$ é a energia total fornecida.',
  },
  {
    id: 44,
    front: 'Soma dos termos de uma Progressão Aritmética finita ($S_n = \\frac{(a_1 + a_n) \\cdot n}{2}$)',
    back: '$S_n$ é a soma dos $n$ termos, $a_1$ é o primeiro termo, $a_n$ é o último termo e $n$ é a quantidade de termos.',
  },
  {
    id: 45,
    front: 'Fórmula da Área de um Círculo ($A = \\pi r^2$)',
    back: '$A$ é a área e $r$ é o raio da circunferência.',
  },
  {
    id: 46,
    front: 'Fórmula do Comprimento de uma Circunferência ($C = 2 \\pi r$)',
    back: '$C$ é o comprimento (perímetro) e $r$ é o raio.',
  },
  {
    id: 47,
    front: 'Equação Geral de uma Reta ($y = ax + b$)',
    back: '$y$ e $x$ são as coordenadas, $a$ é o coeficiente angular (declividade) e $b$ é o coeficiente linear (interseção com eixo y).',
  },
  {
    id: 48,
    front: 'Fórmula de Bhaskara para raízes de $ax^2 + bx + c = 0$ ($x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}$)',
    back: '$x$ representa as raízes, $a, b, c$ são os coeficientes e $\\Delta = b^2 - 4ac$ é o discriminante.',
  },
  {
    id: 49,
    front: 'Definição de Logaritmo ($\\log_b a = x \\iff b^x = a$)',
    back: '$b$ é a base do logaritmo, $a$ é o logaritmando e $x$ é o valor do logaritmo.',
  },
  {
    id: 50,
    front: 'Fórmula da Probabilidade de um Evento ($P(A) = \\frac{n(A)}{n(S)}$)',
    back: '$P(A)$ é a probabilidade do evento $A$, $n(A)$ é o número de casos favoráveis e $n(S)$ é o número total de casos possíveis (espaço amostral).',
  },
  {
    id: 51,
    front: 'Fórmula do Calor Latente ($Q = m \\cdot L$)',
    back: '$Q$ é o calor trocado na mudança de fase, $m$ é a massa e $L$ é o calor latente da substância.',
  },
  {
    id: 52,
    front: 'Relação entre Potência Elétrica, Tensão e Corrente ($P = U \\cdot i$)',
    back: '$P$ é a potência elétrica, $U$ é a tensão e $i$ é a corrente elétrica.',
  },
  {
    id: 53,
    front: 'Fórmula da Pressão Média ($P = \\frac{F}{A}$)',
    back: '$P$ é a pressão, $F$ é a força perpendicular aplicada e $A$ é a área de contato.',
  },
  {
    id: 54,
    front: 'Lei de Snell-Descartes para Refração ($n_1 \\sin \\theta_1 = n_2 \\sin \\theta_2$)',
    back: '$n$ representa os índices de refração dos meios e $\\theta$ representa os ângulos de incidência e refração.',
  },
  {
    id: 55,
    front: 'Fórmula da Energia Potencial em um Campo Gravitacional ($E = -G \\frac{M m}{r}$)',
    back: '$E$ é a energia potencial gravitacional, $G$ é a constante universal, $M$ e $m$ são as massas e $r$ é a distância entre elas.',
  },
  {
    id: 56,
    front: 'Fórmula da Velocidade Angular ($\\omega = \\frac{\\Delta \\phi}{\\Delta t}$)',
    back: '$\\omega$ é a velocidade angular, $\\Delta \\phi$ é a variação do ângulo (espaço angular) e $\\Delta t$ é o tempo.',
  },
  {
    id: 57,
    front: 'Relação de Transformação de Escalas Termométricas (Celsius e Kelvin) ($T_K = T_C + 273$)',
    back: '$T_K$ é a temperatura em Kelvin e $T_C$ é a temperatura em graus Celsius.',
  },
  {
    id: 58,
    front: 'Fórmula da Força Elétrica (Lei de Coulomb) ($F = k \\frac{|Q_1 \\cdot Q_2|}{r^2}$)',
    back: '$F$ é a força elétrica, $k$ é a constante eletrostática, $Q_1$ e $Q_2$ são as cargas e $r$ é a distância entre elas.',
  },
  {
    id: 59,
    front: 'Fórmula do Termo Geral de uma Progressão Geométrica ($a_n = a_1 \\cdot q^{n-1}$)',
    back: '$a_n$ é o enésimo termo, $a_1$ é o primeiro termo, $q$ é a razão e $n$ é a posição do termo.',
  },
  {
    id: 60,
    front: 'Relação entre Período e Frequência ($T = \\frac{1}{f}$)',
    back: '$T$ é o período (tempo para um ciclo completo) e $f$ é a frequência (ciclos por unidade de tempo).',
  },
];
