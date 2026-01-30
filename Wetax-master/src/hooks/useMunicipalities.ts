import { useQuery } from '@tanstack/react-query'
import { ApiService } from '../openapi'

export const useMunicipalities = () => {
  return useQuery({
    queryKey: ['municipalities'],
    queryFn: () => ApiService.getMunicipalities(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  })
}




