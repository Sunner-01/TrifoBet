// components/home/FeaturedMatchesGrid.jsx
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/apuestas/MatchCard";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturedMatchesGrid({ loadingMatches, featuredMatches, handleBetSelection, isBetSelected }) {
  return (
    <motion.section
      className="container"
      initial="visible"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-primary" />
          Apuestas Destacadas
        </h2>
        <Button variant="ghost" asChild>
          <Link href="/apuestas" className="flex items-center">
            Ver todas <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingMatches ? (
          <motion.div variants={fadeInUp} className="col-span-3 flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </motion.div>
        ) : featuredMatches.length > 0 ? (
          featuredMatches.map((match) => (
            <motion.div key={match.id} variants={fadeInUp} className="h-full">
              <MatchCard 
                partido={match} 
                onBet={handleBetSelection} 
                isBetSelected={isBetSelected} 
              />
            </motion.div>
          ))
        ) : (
          <motion.div variants={fadeInUp} className="col-span-3 text-center py-12 text-muted-foreground">
            No hay partidos destacados en este momento.
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
