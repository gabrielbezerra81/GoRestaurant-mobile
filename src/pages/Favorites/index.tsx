import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import formatValue from '../../utils/formatValue';

import {
  Container,
  Header,
  HeaderTitle,
  FoodsContainer,
  FoodList,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
} from './styles';

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  thumbnail_url: string;
  formattedPrice: string;
}

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Food[]>([]);

  const loadFavorites = useCallback(async (isActive: boolean) => {
    const response = await api.get('favorites');

    if (isActive) setFavorites(response.data);
  }, []);

  useEffect(() => {
    async function loadFav(): Promise<void> {
      const response = await api.get('favorites');

      setFavorites(response.data);
      console.log('carregou favoritos');
    }
    loadFav();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      loadFavorites(isActive);

      return () => {
        isActive = false;
      };
    }, [loadFavorites]),
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>Meus favoritos</HeaderTitle>
      </Header>

      <FoodsContainer>
        <FoodList
          data={favorites}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <Food activeOpacity={0.6}>
              <FoodImageContainer>
                <Image
                  style={{ width: 88, height: 88 }}
                  source={{ uri: item.thumbnail_url }}
                />
              </FoodImageContainer>
              <FoodContent>
                <FoodTitle>{item.name}</FoodTitle>
                <FoodDescription>{item.description}</FoodDescription>
                <FoodPricing>{item.formattedPrice}</FoodPricing>
              </FoodContent>
            </Food>
          )}
        />
      </FoodsContainer>
    </Container>
  );
};

export default Favorites;
