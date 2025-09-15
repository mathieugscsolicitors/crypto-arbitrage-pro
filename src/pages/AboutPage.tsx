import React from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { companyInfo, features } from '../data/company';
import {
  Shield,
  TrendingUp,
  BarChart,
  Headphones,
  Users,
  Globe,
  Award,
  Target,
  CheckCircle
} from 'lucide-react';

const iconMap = {
  Shield,
  TrendingUp,
  BarChart,
  Headphones
};

export function AboutPage() {
  const milestones = [
    {
      year: "2021",
      title: "Fondation",
      description: "Création de Crypto-Arbitrage Pro par une équipe d'experts en finance quantitative et blockchain."
    },
    {
      year: "2022",
      title: "Licence PSAN",
      description: "Obtention de l'agrément AMF comme Prestataire de Services sur Actifs Numériques."
    },
    {
      year: "2023",
      title: "Expansion Européenne",
      description: "Lancement dans 15 pays européens avec plus de 10,000 clients actifs."
    },
    {
      year: "2024",
      title: "Leadership Marché",
      description: "Plus de 25,000 clients et 2.3 milliards d'euros de volume traité."
    }
  ];

  const team = [
    {
      name: "Alexandre Dubois",
      role: "CEO & Co-fondateur",
      bio: "15 ans d'expérience en finance quantitative chez Goldman Sachs et JP Morgan. Expert en algorithmes de trading haute fréquence.",
      avatar: "https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    },
    {
      name: "Marie Chen",
      role: "CTO & Co-fondatrice",
      bio: "Ancienne Lead Developer chez Binance. Spécialiste en architecture blockchain et sécurité des systèmes financiers.",
      avatar: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    },
    {
      name: "Thomas Martin",
      role: "Directeur des Risques",
      bio: "Ex-directeur des risques chez BNP Paribas. Expert en gestion des risques financiers et conformité réglementaire.",
      avatar: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
    }
  ];

  const certifications = [
    {
      name: "PSAN - AMF",
      description: "Prestataire de Services sur Actifs Numériques",
      icon: Award
    },
    {
      name: "ISO 27001",
      description: "Certification sécurité des systèmes d'information",
      icon: Shield
    },
    {
      name: "SOC 2 Type II",
      description: "Audit de sécurité et disponibilité des services",
      icon: CheckCircle
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              À Propos de {companyInfo.name}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              {companyInfo.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-20">
            {Object.entries(companyInfo.stats).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {value}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                  {key === 'usersCount' ? 'Utilisateurs Actifs' :
                   key === 'totalVolume' ? 'Volume Total' :
                   key === 'averageReturn' ? 'Rendement Moyen' :
                   key === 'uptime' ? 'Disponibilité' :
                   key === 'countries' ? 'Pays' :
                   key === 'assetsSupported' ? 'Actifs Supportés' : key}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Notre Mission
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                  Démocratiser l'accès aux stratégies d'investissement crypto professionnelles 
                  en offrant des solutions d'arbitrage automatisées, sécurisées et transparentes 
                  pour tous les investisseurs, du débutant à l'expert.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Notre Vision
                  </h2>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                  Devenir la plateforme de référence mondiale pour l'investissement crypto 
                  intelligent, en combinant innovation technologique, excellence opérationnelle 
                  et service client exceptionnel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Ce Qui Nous Distingue
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Une approche unique combinant technologie de pointe et expertise financière
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon as keyof typeof iconMap];
              return (
                <Card key={feature.id} className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 p-4 rounded-xl">
                      <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Notre Parcours
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              De startup innovante à leader du marché européen
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 dark:bg-blue-800"></div>
            
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className={`relative flex items-center mb-12 ${
                index % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                  <Card className="p-6">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {milestone.description}
                    </p>
                  </Card>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Notre Équipe Dirigeante
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Des experts reconnus en finance et technologie blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="text-center p-8">
                <div className="mb-6">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                    {member.role}
                  </p>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Certifications & Conformité
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Respect des plus hauts standards de sécurité et de conformité
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {certifications.map((cert) => {
              const Icon = cert.icon;
              return (
                <Card key={cert.name} className="text-center p-6">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {cert.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">
                    {cert.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prêt à Commencer Votre Parcours d'Investissement ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez plus de 25,000 investisseurs qui nous font confiance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Ouvrir un Compte
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Nous Contacter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}