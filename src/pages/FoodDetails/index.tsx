import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
  thumbnail_url: string;
  category: number;
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      const response = await api.get<Food>(`foods/${routeParams.id}`);

      setExtras(
        response.data.extras.map(extraItem => ({ ...extraItem, quantity: 0 })),
      );

      const formattedFood: Food = {
        ...response.data,
        formattedPrice: formatValue(response.data.price),
      };

      setFood(formattedFood);
    }

    loadFood();
  }, [routeParams]);

  function handleIncrementExtra(id: number): void {
    const extraIndex = extras.findIndex(extraItem => extraItem.id === id);

    const updatedExtra = extras[extraIndex];
    updatedExtra.quantity += 1;

    setExtras(oldExtras =>
      oldExtras.map(extraItem => {
        if (extraItem.id === id) return { ...updatedExtra };
        return { ...extraItem };
      }),
    );
  }

  function handleDecrementExtra(id: number): void {
    const extraIndex = extras.findIndex(extraItem => extraItem.id === id);

    const updatedExtra = extras[extraIndex];
    if (updatedExtra.quantity > 0) updatedExtra.quantity -= 1;

    setExtras(oldExtras =>
      oldExtras.map(extraItem => {
        if (extraItem.id === id) return { ...updatedExtra };
        return { ...extraItem };
      }),
    );
  }

  function handleIncrementFood(): void {
    setFoodQuantity(quantity => quantity + 1);
  }

  function handleDecrementFood(): void {
    setFoodQuantity(quantity => {
      if (quantity === 1) return quantity;

      return quantity - 1;
    });
  }

  const toggleFavorite = useCallback(async () => {
    try {
      if (!isFavorite) {
        await api.post('favorites', food);
      } else {
        await api.delete(`favorites/${food.id}`);
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log(error);
    }
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    const foodTotal = food.price * foodQuantity;
    const extrasTotal = extras.reduce((total, extra) => {
      return total + extra.quantity * extra.value;
    }, 0);

    return formatValue(foodTotal + extrasTotal);
  }, [extras, food, foodQuantity]);

  async function handleFinishOrder(): Promise<void> {
    try {
      const orderData = {
        product_id: food.id,
        name: food.name,
        description: food.description,
        price: food.price,
        category: food.category,
        thumbnail_url: food.thumbnail_url,
        extras,
      };

      await api.post('orders', orderData);

      navigation.reset({
        index: 0,
        routes: [{ name: 'MainBottom' }],
      });

      navigation.navigate('MainBottom', { screen: 'Orders' });
    } catch (error) {
      console.log(error);
    }
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
