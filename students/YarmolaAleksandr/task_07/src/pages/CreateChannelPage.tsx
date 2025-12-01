import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardHeader, CardContent } from '../shared/ui';
import { ChannelForm } from '../features/channels/ChannelForm';
import { useCreateChannelMutation } from '../shared/api';
import { useAppDispatch } from '../app/hooks';
import { addNotification } from '../app/appSlice';
import type { ChannelFormData } from '../shared/lib/validations';
import toast from 'react-hot-toast';

const CreateChannelPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [createChannel, { isLoading }] = useCreateChannelMutation();

  const handleSubmit = async (data: ChannelFormData) => {
    try {
      await createChannel({
        ...data,
        subscriberCount: 0,
        videoCount: 0,
        thumbnailUrl: data.thumbnailUrl || '',
      }).unwrap();

      toast.success('Channel created successfully!');
      dispatch(addNotification({
        type: 'success',
        title: 'Channel Created',
        message: `"${data.name}" has been added to your catalog`,
      }));

      navigate('/channels');
    } catch (error: any) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create channel');
      dispatch(addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error?.data?.message || 'Could not create the channel. Please try again.',
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/channels">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Channels
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Add New Channel</h1>
          <p className="text-muted-foreground">
            Add a new YouTube channel to your catalog
          </p>
        </CardHeader>
        <CardContent>
          <ChannelForm
            onSubmit={handleSubmit}
            loading={isLoading}
            submitText="Create Channel"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateChannelPage;